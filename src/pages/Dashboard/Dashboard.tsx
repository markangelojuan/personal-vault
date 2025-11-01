import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main>
      <h2>Dashboard {user?.displayName}</h2>
      <button onClick={handleLogout}>Logout</button>
    </main>
  );
};

export default Dashboard;
