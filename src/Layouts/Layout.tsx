import { Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-200">
      <Outlet />
    </div>
  );
};
