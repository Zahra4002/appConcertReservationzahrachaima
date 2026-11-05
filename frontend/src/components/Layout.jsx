
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import AdminNotifications from "./AdminNotifications";

export default function Layout() {
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState(false);
  const nav = useNavigate();

  const links = user?.role === "admin"
    ? [
        ["/catalogue", "Catalogue"],
        ["/admin", "Dashboard"],
        ["/admin/reservations", "Réservations"],
        ["/admin/categories", "Concerts & tickets"],
        ["/admin/users", "Utilisateurs"]
      ]
    : user
      ? [
          ["/catalogue", "Catalogue"],
          ["/mes-reservations", "Mes réservations"]
        ]
      : [
          ["/", "Accueil"],
          ["/catalogue", "Concerts"],
          ["/login", "Connexion"]
        ];

  return (
    <div className={`app-shell ${user?.role === "admin" ? "admin-shell" : ""}`}>

      <header className="navbar">

        {/* Logo */}
        <Link to="/" className="brand">Concertia</Link>

        {/* Bouton menu mobile */}
        <button className="burger" onClick={() => setMenu(!menu)}>
          ☰
        </button>

        {/* Liens navigation */}
        <nav className={menu ? "nav-links open" : "nav-links"}>
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenu(false)}
              className={({ isActive }) => isActive ? "active" : ""}
            >
              {label}
            </NavLink>
          ))}

          {user && (
            <button
              className="text-button"
              onClick={() => {
                logout();
                nav("/");
                setMenu(false);
              }}
            >
              Déconnexion
            </button>
          )}
        </nav>

        {/* Actions à droite de la Navbar */}
        <div className="navbar-actions">

          {/* Notifications uniquement pour admin */}
          {user?.role === "admin" && (
            <AdminNotifications />
          )}

        </div>

      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer>
        <strong>Concertia</strong>
        <span>contact@concertia.tn</span>
      </footer>

    </div>
  );
}
