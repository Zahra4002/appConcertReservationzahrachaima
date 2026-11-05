import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./styles.css";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Catalogue from "./pages/Catalogue";
import ConcertDetails from "./pages/ConcertDetails";
import AuthPage from "./pages/AuthPage";
import Reserve from "./pages/Reserve";
import MyReservations from "./pages/MyReservations";
import Ticket from "./pages/Ticket";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminUsers from "./pages/admin/AdminUsers";

function App() {
  return <AuthProvider><Routes><Route element={<Layout />}><Route path="/" element={<Home />} /><Route path="/catalogue" element={<Catalogue />} /><Route path="/concerts/:id" element={<ConcertDetails />} /><Route path="/login" element={<AuthPage type="login" />} /><Route path="/register" element={<AuthPage type="register" />} /><Route element={<ProtectedRoute />}><Route path="/reserver" element={<Reserve />} /><Route path="/mes-reservations" element={<MyReservations />} /><Route path="/ticket/:id" element={<Ticket />} /></Route><Route element={<ProtectedRoute admin />}><Route path="/admin" element={<AdminDashboard />} /><Route path="/admin/reservations" element={<AdminReservations />} /><Route path="/admin/categories" element={<AdminCategories />} /><Route path="/admin/users" element={<AdminUsers />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes></AuthProvider>;
}

createRoot(document.getElementById("root")).render(<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>);
