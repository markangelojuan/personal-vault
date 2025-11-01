import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PrivateLayout = () => {
  const user = useAuth();

  if (!user) return <Navigate to="/" replace />;
  return (
    <div>
      <Outlet />
    </div>
  );
};
