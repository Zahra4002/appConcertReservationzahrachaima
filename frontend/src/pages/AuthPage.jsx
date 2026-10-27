import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
export default function AuthPage({ type }) {
  const loginMode = type === "login"; const { login, register } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState(loginMode ? { email: "", motDePasse: "" } : { nom: "", prenom: "", email: "", telephone: "", motDePasse: "" });
  const [error, setError] = useState(""); const fields = loginMode ? [["email", "E-mail", "email"], ["motDePasse", "Mot de passe", "password"]] : [["nom", "Nom"], ["prenom", "Prénom"], ["email", "E-mail", "email"], ["telephone", "Téléphone"], ["motDePasse", "Mot de passe", "password"]];
  async function submit(event) { event.preventDefault(); setError(""); try { await (loginMode ? login(form) : register(form)); navigate(loginMode ? "/catalogue" : "/catalogue"); } catch (err) { setError(err.response?.data?.message || "Impossible de se connecter."); } }
  return <div className="auth-page"><div className="auth-card"><p className="eyebrow">{loginMode ? "BON RETOUR" : "BIENVENUE"}</p><h2>{loginMode ? "Connexion" : "Créer un compte"}</h2><form onSubmit={submit} className="form-grid">{fields.map(([name, label, inputType = "text"]) => <label key={name}>{label}<input required={name !== "telephone"} type={inputType} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} /></label>)}<button className="button full-button">{loginMode ? "Se connecter" : "S'inscrire"}</button>{error && <p className="error-text">{error}</p>}</form><p className="form-link">{loginMode ? <>Pas encore de compte ? <Link to="/register">Inscription</Link></> : <>Déjà inscrit ? <Link to="/login">Connexion</Link></>}</p></div></div>;
}
