import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const AppBar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("adiós");
    } catch (error) {
      console.error(error);
      toast.error("Yikes, that didn't go as planned! Try later! 😅");
    }
  };

  return (
    <header className="bg-gray-900/90 text-gray-100 p-4 flex items-center justify-between shadow-lg md:p-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold font-mono text-gray-100 md:text-2xl">
          M's Vault
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm bg-linear-to-r from-yellow-400 via-orange-400 to-red-300 bg-clip-text text-transparent md:text-md">{user?.displayName || "User"}</span>
        <button
          onClick={handleLogout}
          className="bg-yellow-600 hover:bg-yellow-700 text-gray-100 px-3 py-1 rounded-md text-sm cursor-pointer md:px-4 md:py-2"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default AppBar;