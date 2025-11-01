import { Route, Routes } from "react-router-dom";
import { Layout } from "./Layouts/Layout";
import { PrivateLayout } from "./Layouts/PrivateLayout";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}></Route>

      {/* Private pages */}
      <Route element={<PrivateLayout />}></Route>
    </Routes>
  );
}

export default App;
