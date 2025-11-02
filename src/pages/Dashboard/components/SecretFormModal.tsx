import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface SecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (secret: SecretData) => void;
  editData?: SecretData;
}

export interface SecretData {
  id?: string;
  title: string;
  username: string;
  password: string;
}

const SecretFormModal = ({
  isOpen,
  onClose,
  onSave,
  editData,
}: SecretModalProps) => {
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setTitle(editData.title || "");
        setUsername(editData.username || "");
        setPassword(editData.password || "");
      } else {
        setTitle("");
        setUsername("");
        setPassword("");
      }
    }
  }, [isOpen, editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      console.error("Title is required");
      return;
    }

    if (!password.trim()) {
      console.error("Password/Secret is required");
      return;
    }

    setLoading(true);
    try {
      onSave({
        id: editData?.id,
        title: title.trim(),
        username: username.trim(),
        password: password.trim(),
      });
      toast.success(editData ? "Secret updated!" : "Secret added!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Yikes, that didn't go as planned! Try later! 😅");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isFormValid = title.trim().length > 0 && password.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 md:p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-4">
          {editData ? "Edit Secret" : "Add New Secret"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Title/Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Gmail Account, Bank Name"
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              User Key
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Username/Email"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Secret <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={255}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Password/Pin"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-gray-100 px-4 py-2 rounded-lg disabled:bg-gray-400 cursor-pointer"
              disabled={loading || !isFormValid}
            >
              {loading ? "Saving..." : editData ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SecretFormModal;
