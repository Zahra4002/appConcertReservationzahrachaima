
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {

  // Récupérer l'utilisateur sans provoquer une erreur JSON
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("concert_user");

      if (!savedUser || savedUser === "undefined") {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Erreur utilisateur :", error);
      localStorage.removeItem("concert_user");
      return null;
    }
  });

  const [loading, setLoading] = useState(
    Boolean(localStorage.getItem("concert_token"))
  );

  useEffect(() => {
    const token = localStorage.getItem("concert_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api.get("/auth/me")
      .then(({ data }) => {
        // Adapter selon la structure de la réponse API
        const userData = data.user || data;
        setUser(userData);
        localStorage.setItem("concert_user", JSON.stringify(userData));
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  function save(data) {
    if (!data.token || !data.user) {
      throw new Error("Réponse API invalide : token ou utilisateur manquant.");
    }

    localStorage.setItem("concert_token", data.token);
    localStorage.setItem("concert_user", JSON.stringify(data.user));

    setUser(data.user);
  }

  async function login(values) {
    const response = await api.post("/auth/login", values);
    save(response.data);
  }

  async function register(values) {
    const response = await api.post("/auth/register", values);
    save(response.data);
  }

  function logout() {
    localStorage.removeItem("concert_token");
    localStorage.removeItem("concert_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
