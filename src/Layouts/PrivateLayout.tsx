import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppBar from "../components/AppBar";
import { useEffect } from "react";
import { useLoading } from "../context/LoadingContext";

export const PrivateLayout = () => {
  const { user, loading } = useAuth();
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  if (loading) {
    return null;
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
