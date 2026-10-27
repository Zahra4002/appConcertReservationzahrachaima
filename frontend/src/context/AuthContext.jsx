import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("concert_user") || "null"));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("concert_token")));
  useEffect(() => {
    if (!localStorage.getItem("concert_token")) return setLoading(false);
    api.get("/auth/me").then(({ data }) => setUser(data)).catch(logout).finally(() => setLoading(false));
  }, []);
  function save(data) {
    localStorage.setItem("concert_token", data.token);
    localStorage.setItem("concert_user", JSON.stringify(data.user));
    setUser(data.user);
  }
  async function login(values) { save((await api.post("/auth/login", values)).data); }
  async function register(values) { save((await api.post("/auth/register", values)).data); }
  function logout() {
    localStorage.removeItem("concert_token");
    localStorage.removeItem("concert_user");
    setUser(null);
  }
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
