import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import PassphraseModal from "./components/PassphraseModal";
import { decryptText, encryptText, generateIV } from "../../utils/crypto";
import toast from "react-hot-toast";
import SecretFormModal, { type SecretData } from "./components/SecretFormModal";
import SecretsTable from "./components/SecretsTable";
import { useLoading } from "../../context/LoadingContext";
import { logAudit } from "../../utils/audit";
import { AUDIT_ACTIONS } from "../../constants/auditActions";
import { useInactivite } from "../../hooks/useInactive";

interface Secret {
  id: string;
  title: string;
  username: string;
  password: string;
  createdAt: string;
}

const Dashboard = () => {
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [kdfSalt, setKdfSalt] = useState<string>("");
  const [encryptedTest, setEncryptedTest] = useState<string>("");

  const [showSecretModal, setShowSecretModal] = useState(false);
  const [editingSecret, setEditingSecret] = useState<SecretData | undefined>();
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const { setLoading } = useLoading();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [firstVisible, setFirstVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  useInactivite(10);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      setSecrets([]);
      setEncryptionKey(null);
    };
  }, []);

  useEffect(() => {
    if (!user?.email) return;

    const checkSetup = async () => {
      const userDoc = await getDoc(doc(db, "authorizedUsers", user.email!));
      const data = userDoc.data();

      const hasPassphrase = data?.kdf_salt && data?.encrypted_test;

      if (hasPassphrase) {
        setKdfSalt(data.kdf_salt);
        setEncryptedTest(data.encrypted_test);
        setIsSetup(false);
      } else {
        setIsSetup(true);
      }

      setShowModal(true);
    };

    checkSetup();
  }, [user]);

  useEffect(() => {
    if (isUnlocked && encryptionKey && user?.email) {
      fetchSecrets("initial");
    }
  }, [isUnlocked, encryptionKey, user]);

  const fetchSecrets = async (
    direction: "next" | "prev" | "initial" = "initial"
  ) => {
    if (!encryptionKey || !user?.email) return;

    setLoading(true);
    try {
      const docs = await fetchSecretsFromFirestore(direction);
      const { secretDocs, hasMore } = processDocuments(docs, direction);

      updatePaginationState(direction, hasMore, secretDocs);

      const decryptedSecrets = await decryptSecrets(secretDocs);
      setSecrets(decryptedSecrets);
    } catch (error) {
      console.error("Failed to fetch secrets:", error);
      toast.error("Yikes, that didn't go as planned! Try later! 😅");
    } finally {
      setLoading(false);
    }
  };

  const fetchSecretsFromFirestore = async (
    direction: "next" | "prev" | "initial"
  ) => {
    let q = query(
      collection(db, "secrets"),
      where("userId", "==", user?.email),
      where("is_deleted", "==", false),
      orderBy("created_at", "desc"),
      limit(pageSize + 1)
    );

    if (direction === "next" && lastVisible) {
      q = query(q, startAfter(lastVisible));
    } else if (direction === "prev" && firstVisible) {
      q = query(
        collection(db, "secrets"),
        where("userId", "==", user?.email),
        where("is_deleted", "==", false),
        orderBy("created_at", "desc"),
        endBefore(firstVisible),
        limitToLast(pageSize + 1)
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs;
  };

  const processDocuments = (
    docs: QueryDocumentSnapshot<DocumentData>[],
    direction: string
  ) => {
    const hasMore = docs.length > pageSize;
    const secretDocs =
      direction === "prev" && hasMore
        ? docs.slice(1)
        : hasMore
        ? docs.slice(0, pageSize)
        : docs;

    return { secretDocs, hasMore };
  };

  const updatePaginationState = (
    direction: "next" | "prev" | "initial",
    hasMore: boolean,
    secretDocs: QueryDocumentSnapshot<DocumentData>[]
  ) => {
    if (direction === "next") {
      setHasNextPage(hasMore);
      setHasPrevPage(true);
    } else if (direction === "prev") {
      setHasPrevPage(hasMore);
      setHasNextPage(true);
    } else {
      setHasNextPage(hasMore);
      setHasPrevPage(false);
    }

    if (secretDocs.length > 0) {
      setFirstVisible(secretDocs[0]);
      setLastVisible(secretDocs[secretDocs.length - 1]);
    } else {
      setFirstVisible(null);
      setLastVisible(null);
    }
  };

  const decryptSecrets = async (
    docs: QueryDocumentSnapshot<DocumentData>[]
  ) => {
    const decryptedSecrets: Secret[] = [];

    for (const docSnap of docs) {
      const data = docSnap.data();
      try {
        const decryptedTitle = await decryptText(
          data.title,
          data.iv,
          encryptionKey!
        );
        const decryptedUsername = await decryptText(
          data.username,
          data.iv,
          encryptionKey!
        );
        const decryptedPassword = await decryptText(
          data.secret,
          data.iv,
          encryptionKey!
        );

        decryptedSecrets.push({
          id: docSnap.id,
          title: decryptedTitle,
          username: decryptedUsername,
          password: decryptedPassword,
          createdAt: data.created_at?.toDate().toLocaleDateString() || "N/A",
        });
      } catch (error) {
        console.error("Failed to decrypt secret:", docSnap.id, error);
      }
    }

    return decryptedSecrets;
  };

  const handlePassphraseSuccess = (key: CryptoKey) => {
    setEncryptionKey(key);
    setIsUnlocked(true);
    setShowModal(false);
  };

  const handleAddSecret = () => {
    setEditingSecret(undefined);
    setShowSecretModal(true);
  };

  const handleEditSecret = (secret: Secret) => {
    setEditingSecret({
      id: secret.id,
      title: secret.title,
      username: secret.username,
      password: secret.password,
    });
    setShowSecretModal(true);
  };

  const handleCloseSecretModal = () => {
    setShowSecretModal(false);
    setEditingSecret(undefined);
  };

  const handleSaveSecret = async (secret: SecretData) => {
    if (!encryptionKey || !user?.email) {
      console.error("Encryption key not available");
      return;
    }

    try {
      const iv = generateIV();

      // Encrypt all fields with the IV
      const encryptedTitle = await encryptText(secret.title, iv, encryptionKey);
      const encryptedUsername = await encryptText(
        secret.username || "",
        iv,
        encryptionKey
      );
      const encryptedPassword = await encryptText(
        secret.password,
        iv,
        encryptionKey
      );

      if (secret.id) {
        // Update existing secret
        await updateDoc(doc(db, "secrets", secret.id), {
          title: encryptedTitle,
          username: encryptedUsername,
          secret: encryptedPassword,
          iv: iv,
          updated_at: serverTimestamp(),
        });
        await logAudit(user?.email || 'Unknown user', AUDIT_ACTIONS.SECRET_UPDATED);
      } else {
        // Create new secret
        await addDoc(collection(db, "secrets"), {
          userId: user.email,
          title: encryptedTitle,
          username: encryptedUsername,
          secret: encryptedPassword,
          iv: iv,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          is_deleted: false,
        });
        await logAudit(user?.email || 'Unknown user', AUDIT_ACTIONS.SECRET_CREATED);
      }

      setCurrentPage(1);
      setFirstVisible(null);
      setLastVisible(null);
      await fetchSecrets("initial");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleDeleteSecret = async (id: string) => {
    if (!confirm("Delete this secret permanently?")) return;

    try {
      await updateDoc(doc(db, "secrets", id), {
        is_deleted: true,
        updated_at: serverTimestamp(),
      });

      setCurrentPage(1);
      setFirstVisible(null);
      setLastVisible(null);
      await fetchSecrets("initial");
      toast.success("Secret deleted!");
      await logAudit(user?.email || 'Unknown user', AUDIT_ACTIONS.SECRET_DELETED);
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Yikes, that didn't go as planned! Try later! 😅");
    }
  };

  const handleNextPage = () => {
    fetchSecrets("next");
    setCurrentPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    fetchSecrets("prev");
    setCurrentPage((p) => p - 1);
  };

  const handleLockToggle = () => {
    if (isUnlocked) {
      // Lock the vault
      setIsUnlocked(false);
      setEncryptionKey(null);
      setSecrets([]);
      setShowModal(true);
      toast.success("Vault locked! 🔒");
    }
  };

  if (!user?.email) return null;

  if (!isUnlocked) {
    return (
      <>
        {showModal && (
          <PassphraseModal
            isSetup={isSetup}
            userEmail={user.email}
            onSuccess={handlePassphraseSuccess}
            kdfSalt={kdfSalt}
            encryptedTest={encryptedTest}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-8 md:overflow-hidden md:flex md:items-center">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Secrets</h2>
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={handleLockToggle}
                className={`cursor-pointer px-4 py-1 rounded text-xs font-medium transition-colors ${
                  isUnlocked
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isUnlocked ? "Lock" : "Unlock"}
              </button>
            </div>
          </div>
          <button
            onClick={handleAddSecret}
            className="bg-yellow-600 text-gray-100 hover:bg-yellow-700 px-4 py-2 rounded-lg cursor-pointer"
          >
            + Add Secret
          </button>
        </div>

        <SecretsTable
          secrets={secrets}
          onEdit={handleEditSecret}
          onDelete={handleDeleteSecret}
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          onNextPage={handleNextPage}
          onPrevPage={handlePrevPage}
        />
      </div>

      <SecretFormModal
        isOpen={showSecretModal}
        onClose={handleCloseSecretModal}
        onSave={handleSaveSecret}
        editData={editingSecret}
      />
    </div>
  );
};

export default Dashboard;
