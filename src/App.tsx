import { Route, Routes } from "react-router-dom";
import { Layout } from "./Layouts/Layout";
import { PrivateLayout } from "./Layouts/PrivateLayout";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Login />} />
        </Route>

        {/* Private pages */}
        <Route element={<PrivateLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
        }}
      />
    </>
  );
}

export default App;
