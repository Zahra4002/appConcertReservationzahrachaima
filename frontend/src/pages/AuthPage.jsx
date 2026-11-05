
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ type }) {
  const loginMode = type === "login";
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(
    loginMode
      ? { email: "", motDePasse: "" }
      : {
          nom: "",
          prenom: "",
          email: "",
          telephone: "",
          motDePasse: ""
        }
  );

  const fields = loginMode
    ? [
        ["email", "E-mail", "email"],
        ["motDePasse", "Mot de passe", "password"]
      ]
    : [
        ["nom", "Nom"],
        ["prenom", "Prénom"],
        ["email", "E-mail", "email"],
        ["telephone", "Téléphone"],
        ["motDePasse", "Mot de passe", "password"]
      ];

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (loginMode) {
        await login(form);
        navigate("/catalogue");
      } else {
        await register(form);

        setSuccess(
          "Votre demande a été envoyée. Veuillez attendre la validation de l'administrateur."
        );

        setForm({
          nom: "",
          prenom: "",
          email: "",
          telephone: "",
          motDePasse: ""
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Une erreur est survenue."
      );
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <p className="eyebrow">
          {loginMode ? "BON RETOUR" : "BIENVENUE"}
        </p>

        <h2>
          {loginMode ? "Connexion" : "Créer un compte"}
        </h2>

        <form onSubmit={submit} className="form-grid">

          {fields.map(([name, label, inputType = "text"]) => (
            <label key={name}>
              {label}

              <input
                required={name !== "telephone"}
                type={inputType}
                value={form[name]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [name]: e.target.value
                  })
                }
              />
            </label>
          ))}

          <button className="button full-button">
            {loginMode ? "Se connecter" : "S'inscrire"}
          </button>

          {error && (
            <p className="error-text">{error}</p>
          )}

          {success && (
            <p className="success-text">{success}</p>
          )}

        </form>

        <p className="form-link">
          {loginMode ? (
            <>
              Pas encore de compte ? <Link to="/register">Inscription</Link>
            </>
          ) : (
            <>
              Déjà inscrit ? <Link to="/login">Connexion</Link>
            </>
          )}
        </p>

      </div>
    </div>
  );
}
