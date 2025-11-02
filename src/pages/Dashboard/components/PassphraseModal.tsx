import { useEffect, useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../config/firebase";
import {
  generateSalt,
  deriveKey,
  createEncryptedTest,
  verifyPassphrase,
} from "../../../utils/crypto";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { logAudit } from "../../../utils/audit";
import { AUDIT_ACTIONS } from "../../../constants/auditActions";

interface PassphraseModalProps {
  isSetup: boolean;
  userEmail: string;
  onSuccess: (key: CryptoKey) => void;
  kdfSalt?: string;
  encryptedTest?: string;
}

type PassphraseValidationType = {
  lengthOk: boolean;
  hasSpecialChar: boolean;
  hasSpace: boolean;
  hasMixedCase: boolean;
};

const PassphraseModal = ({
  isSetup,
  userEmail,
  onSuccess,
  kdfSalt,
  encryptedTest,
}: PassphraseModalProps) => {
  const { logout } = useAuth();
  const [passphrase, setPassphrase] = useState<string>("");
  const [confirmPassphrase, setConfirmPassphrase] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [validation, setValidation] = useState<PassphraseValidationType>({
    lengthOk: false, // 3+ words AND 12-40 chars
    hasSpecialChar: false,
    hasSpace: false,
    hasMixedCase: false,
  });

  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const MAX_ATTEMPTS = 3;

  const handleSetupPassphrase = async () => {
    if (passphrase !== confirmPassphrase) {
      toast.error("Mismatch!");
      return;
    }
    setLoading(true);
    try {
      // Generate salt and derive key
      const salt = generateSalt();
      const key = await deriveKey(passphrase, salt);

      // Create encrypted test value
      const encryptedTest = await createEncryptedTest(key);

      await updateDoc(doc(db, "authorizedUsers", userEmail), {
        kdf_salt: salt,
        encrypted_test: encryptedTest,
        updated_at: serverTimestamp(),
      });

      toast.success("All set — don't forget! 🔐");
      await logAudit(userEmail, AUDIT_ACTIONS.PASSPHRASE_SETUP);
      onSuccess(key);
    } catch (error) {
      console.error(error);
      toast.error("Yikes, that didn't go as planned! Try later! 😅");
      await logAudit(userEmail, AUDIT_ACTIONS.PASSPHRASE_SETUP_FAILED, {
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPassphrase = async () => {
    if (!passphrase.trim()) {
      console.error("Missing passphrase");
      return;
    }
    setLoading(true);
    try {
      // Derive key from passphrase
      const key = await deriveKey(passphrase, kdfSalt!);

      // Verify by trying to decrypt test value
      const isValid = await verifyPassphrase(key, encryptedTest!);

      if (isValid) {
        toast.success("Vault unlocked! 🔓");
        setFailedAttempts(0);
        await logAudit(userEmail, AUDIT_ACTIONS.VAULT_UNLOCK);
        onSuccess(key);
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          toast.error("Sorry buddy, logging you out...");
          await logAudit(userEmail, AUDIT_ACTIONS.MAX_ATTEMPT_REACHED);
          await logout();
        } else {
          toast.error(
            `That ain't it, chief. ${MAX_ATTEMPTS - newAttempts} attempts left. 🚫`
          );
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Yikes, that didn't go as planned! Try later! 😅");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSetup) {
      handleSetupPassphrase();
    } else {
      handleVerifyPassphrase();
    }
  };

  const handleLogout = async () => {
    try {
      logAudit(userEmail, AUDIT_ACTIONS.LOGOUT);
      await logout();
      toast.success("adiós");      
    } catch (error) {
      console.error(error);
      toast.error("Yikes, that didn't go as planned! Try later! 😅");
    }
  };

  useEffect(() => {
    const words = passphrase
      .trim()
      .split(/\s+/)
      .filter((word) => /[a-zA-Z0-9]/.test(word) && word.length >= 2);

    setValidation({
      lengthOk:
        words.length >= 3 && passphrase.length >= 12 && passphrase.length <= 40,
      hasSpecialChar: /[^a-zA-Z0-9\s]/.test(passphrase),
      hasSpace: /\s/.test(passphrase),
      hasMixedCase: /[a-z]/.test(passphrase) && /[A-Z]/.test(passphrase),
    });
  }, [passphrase]);

  const isValid = Object.values(validation).every((v) => v);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
      >
        <h2 className="text-xl font-bold mb-2 md:text-2xl">
          {isSetup ? "Create Master Passphrase" : "Enter Master Passphrase"}
        </h2>
        <p className="text-gray-600 mb-4 text-sm">
          {isSetup
            ? "Think of a passphrase as a password that learned grammar. A few words, a lot more power."
            : "Remember it, or it remembers *you*. 💀"}
        </p>

        {isSetup && (
          <motion.ul className="text-xs text-red-400 mb-6 grid grid-cols-2 gap-x-6 gap-y-1 md:text-sm">
            <li className={validation.lengthOk ? "text-green-600" : ""}>
              - 3+ words, 12-40 characters
            </li>
            <li className={validation.hasSpecialChar ? "text-green-600" : ""}>
              - Use speci@l character$
            </li>
            <li className={validation.hasSpace ? "text-green-600" : ""}>
              - Use spa ces
            </li>
            <li className={validation.hasMixedCase ? "text-green-600" : ""}>
              - UPPER & lowercase
            </li>
          </motion.ul>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium mb-2 md:text-sm">
              Passphrase {passphrase.length > 0 && `(${passphrase.length})`}
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter passphrase"
              autoFocus
            />
          </div>

          {isSetup && (
            <div className="mb-6">
              <label className="block text-xs font-medium mb-2 md:text-sm">
                Confirm Passphrase
              </label>
              <input
                type="password"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm passphrase"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              (isSetup && !isValid) ||
              (!isSetup && !passphrase.trim())
            }
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-gray-100 py-2 rounded-lg cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : isSetup ? "Create" : "Unlock"}
          </button>
        </form>

        <button
          onClick={handleLogout}
          className="w-full mt-4 text-gray-400 text-sm hover:text-gray-800 underline cursor-pointer"
        >
          Logout
        </button>
      </motion.div>
    </div>
  );
};

export default PassphraseModal;
