import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppBar from "../components/AppBar";

export const PrivateLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  return (
    <div className="flex flex-col h-screen">
      <AppBar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
