import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Menu from "./pages/Menu";
import Recipes from "./pages/Recipes";
import Waste from "./pages/Waste";
import Analytics from "./pages/Analytics";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/waste" element={<Waste />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Route>

        {/* Unknown Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
