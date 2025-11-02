import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import PassphraseModal from "./components/PassphraseModal";

const Dashboard = () => {
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [kdfSalt, setKdfSalt] = useState<string>("");
  const [encryptedTest, setEncryptedTest] = useState<string>("");

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

  const handlePassphraseSuccess = (key: CryptoKey) => {
    setEncryptionKey(key);
    setIsUnlocked(true);
    setShowModal(false);
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
    <div className="h-full p-8">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p className="mt-4">🔓 Vault unlocked!</p>
    </div>
  );
};

export default Dashboard