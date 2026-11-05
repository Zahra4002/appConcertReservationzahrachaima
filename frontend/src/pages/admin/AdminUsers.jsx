<<<<<<< HEAD

import { useEffect, useState } from "react";
import api from "../../api/axios";

const emptyUser = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  motDePasse: "",
  role: "user",
  statutCompte: "en_attente"
};
=======
import { useEffect, useState } from "react";
import api from "../../api/axios";

const emptyUser = { nom: "", prenom: "", email: "", telephone: "", motDePasse: "", role: "user" };
>>>>>>> origin/notification

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
<<<<<<< HEAD
  const [loadingAction, setLoadingAction] = useState(null);

  // Charger les utilisateurs
  async function load() {
    const { data } = await api.get("/admin/users");
    setUsers(data);
  }

  useEffect(() => {
    load().catch((err) => {
      setError(
        err.response?.data?.message ||
        "Impossible de charger les utilisateurs."
      );
    });
  }, []);

  // Accepter un utilisateur
  async function accepterUtilisateur(id) {
    setError("");
    setSuccess("");
    setLoadingAction(id);

    try {
      const { data } = await api.put(
        `/admin/users/${id}/approve`
      );

      await load();

      setSuccess(data.message);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Erreur lors de l'acceptation du compte."
      );
    } finally {
      setLoadingAction(null);
    }
  }

  // Refuser un utilisateur
  async function refuserUtilisateur(id) {
    const confirmation = window.confirm(
      "Voulez-vous vraiment refuser ce compte ?"
    );

    if (!confirmation) return;

    setError("");
    setSuccess("");
    setLoadingAction(id);

    try {
      const { data } = await api.put(
        `/admin/users/${id}/refuse`
      );

      await load();

      setSuccess(data.message);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Erreur lors du refus du compte."
      );
    } finally {
      setLoadingAction(null);
    }
  }

  // Modifier les champs du formulaire
  function change(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  // Préparer la modification
  function startEdit(user) {
    setEditing(user._id);

    setForm({
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      telephone: user.telephone || "",
      motDePasse: "",
      role: user.role || "user",
      statutCompte: user.statutCompte || "en_attente"
    });

    setError("");
    setSuccess("");
  }

  // Réinitialiser le formulaire
  function reset() {
    setEditing(null);
    setForm(emptyUser);
  }

  // Ajouter ou modifier un utilisateur
  async function submit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

=======

  function load() {
    return api.get("/admin/users").then(({ data }) => setUsers(data));
  }
  useEffect(() => { load().catch((err) => setError(err.response?.data?.message || "Impossible de charger les utilisateurs.")); }, []);
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  function startEdit(user) { setEditing(user._id); setForm({ ...user, motDePasse: "" }); setError(""); setSuccess(""); }
  function reset() { setEditing(null); setForm(emptyUser); }
  async function submit(event) {
    event.preventDefault(); setError(""); setSuccess("");
>>>>>>> origin/notification
    try {
      const { data } = editing
        ? await api.put(`/admin/users/${editing}`, form)
        : await api.post("/admin/users", form);
<<<<<<< HEAD

      if (editing) {
        setUsers((prev) =>
          prev.map((item) =>
            item._id === data._id ? data : item
          )
        );
      } else {
        setUsers((prev) => [data, ...prev]);
      }

      setSuccess(
        editing
          ? "L'utilisateur a été modifié avec succès."
          : "L'utilisateur a été ajouté avec succès."
      );

      reset();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Enregistrement impossible."
      );
    }
  }

  // Supprimer un utilisateur
  async function remove(user) {
    const currentUser = JSON.parse(
      localStorage.getItem("concert_user") || "null"
    );

    if (user._id === (currentUser?.id || currentUser?._id)) {
      setError(
        "Vous ne pouvez pas supprimer votre propre compte administrateur."
      );
      return;
    }

    if (
      !window.confirm(
        `Supprimer le compte de ${user.prenom} ${user.nom} ?`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(`/admin/users/${user._id}`);

      setUsers((prev) =>
        prev.filter((item) => item._id !== user._id)
      );

      setSuccess("L'utilisateur a été supprimé avec succès.");

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Suppression impossible."
      );
    }
  }

  if (!users) {
    return <div className="page-state">Chargement...</div>;
  }

  return (
    <section className="section admin-page">

      <p className="eyebrow">UTILISATEURS</p>
      <h2>Gestion des comptes</h2>

      {error && (
        <p className="error-text">{error}</p>
      )}

      {success && (
        <p className="success-message" role="status">
          {success}
        </p>
      )}

      {/* Formulaire d'ajout et modification */}
      <form
        className="admin-form user-form"
        onSubmit={submit}
      >
        <h3>
          {editing
            ? "Modifier l'utilisateur"
            : "Ajouter un utilisateur"}
        </h3>

        <div className="form-row">

          <input
            name="prenom"
            placeholder="Prénom"
            required
            value={form.prenom}
            onChange={change}
          />

          <input
            name="nom"
            placeholder="Nom"
            required
            value={form.nom}
            onChange={change}
          />

          <input
            name="email"
            type="email"
            placeholder="E-mail"
            required
            value={form.email}
            onChange={change}
          />

        </div>

        <div className="form-row">

          <input
            name="telephone"
            placeholder="Téléphone"
            value={form.telephone}
            onChange={change}
          />

          <input
            name="motDePasse"
            type="password"
            placeholder={
              editing
                ? "Nouveau mot de passe (facultatif)"
                : "Mot de passe"
            }
            required={!editing}
            value={form.motDePasse}
            onChange={change}
          />

          <select
            name="role"
            value={form.role}
            onChange={change}
          >
            <option value="user">Utilisateur</option>
            <option value="admin">Administrateur</option>
          </select>
          {editing && (
  <select
    name="statutCompte"
    value={form.statutCompte}
    onChange={change}
  >
    <option value="en_attente">En attente</option>
    <option value="accepte">Accepté</option>
    <option value="refuse">Refusé</option>
  </select>
)}
          <button className="button" type="submit">
            {editing ? "Enregistrer" : "Ajouter"}
          </button>

          {editing && (
            <button
              type="button"
              className="outline-button"
              onClick={reset}
            >
              Annuler
            </button>
          )}

        </div>
      </form>

      {/* Tableau des utilisateurs */}
      <div className="table-wrap">

        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>E-mail</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((item) => (

              <tr key={item._id}>

                <td>
                  {item.prenom} {item.nom}
                </td>

                <td>{item.email}</td>

                <td>{item.telephone || "—"}</td>

                <td>
                  {item.role === "admin"
                    ? "Administrateur"
                    : "Utilisateur"}
                </td>

                {/* Statut du compte */}
                <td>
                  {item.statutCompte === "accepte" && (
                    <span className="success-message">
                      Accepté
                    </span>
                  )}

                  {item.statutCompte === "en_attente" && (
                    <span className="error-text">
                      En attente
                    </span>
                  )}

                  {item.statutCompte === "refuse" && (
                    <span className="error-text">
                      Refusé
                    </span>
                  )}
                </td>

                <td>

                  {/* Accepter et refuser uniquement si en attente */}
                  {item.statutCompte === "en_attente" &&
                    item.role !== "admin" && (
                    <>
                      <button
                        type="button"
                        className="button"
                        disabled={loadingAction === item._id}
                        onClick={() =>
                          accepterUtilisateur(item._id)
                        }
                      >
                        {loadingAction === item._id
                          ? "Traitement..."
                          : "Accepter"}
                      </button>

                      <button
                        type="button"
                        className="danger-text-button"
                        disabled={loadingAction === item._id}
                        onClick={() =>
                          refuserUtilisateur(item._id)
                        }
                      >
                        Refuser
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                  >
                    Modifier
                  </button>

                  <button
                    type="button"
                    className="danger-text-button"
                    onClick={() => remove(item)}
                  >
                    Supprimer
                  </button>

                </td>

              </tr>

            ))}
          </tbody>
        </table>

      </div>

    </section>
  );
=======
      setUsers(editing ? users.map((item) => item._id === data._id ? data : item) : [data, ...users]);
      setSuccess(editing ? "L'utilisateur a été modifié avec succès." : "L'utilisateur a été ajouté avec succès.");
      reset();
    } catch (err) { setError(err.response?.data?.message || "Enregistrement impossible."); }
  }
  async function remove(user) {
    if (user._id === JSON.parse(localStorage.getItem("concert_user") || "null")?.id)
      return setError("Vous ne pouvez pas supprimer votre propre compte administrateur.");
    if (!window.confirm(`Supprimer le compte de ${user.prenom} ${user.nom} ?`)) return;
    setError(""); setSuccess("");
    try {
      await api.delete(`/admin/users/${user._id}`);
      setUsers(users.filter((item) => item._id !== user._id));
      setSuccess("L'utilisateur a été supprimé avec succès.");
    } catch (err) { setError(err.response?.data?.message || "Suppression impossible."); }
  }
  if (!users) return <div className="page-state">Chargement...</div>;
  return <section className="section admin-page"><p className="eyebrow">UTILISATEURS</p><h2>Gestion des comptes</h2>
    {error && <p className="error-text">{error}</p>}{success && <p className="success-message" role="status">{success}</p>}
    <form className="admin-form user-form" onSubmit={submit}><h3>{editing ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</h3><div className="form-row"><input name="prenom" placeholder="Prénom" required value={form.prenom} onChange={change} /><input name="nom" placeholder="Nom" required value={form.nom} onChange={change} /><input name="email" type="email" placeholder="E-mail" required value={form.email} onChange={change} /></div><div className="form-row"><input name="telephone" placeholder="Téléphone" value={form.telephone || ""} onChange={change} /><input name="motDePasse" type="password" placeholder={editing ? "Nouveau mot de passe (facultatif)" : "Mot de passe"} required={!editing} value={form.motDePasse} onChange={change} /><select name="role" value={form.role} onChange={change}><option value="user">Utilisateur</option><option value="admin">Administrateur</option></select><button className="button">{editing ? "Enregistrer" : "Ajouter"}</button>{editing && <button type="button" className="outline-button" onClick={reset}>Annuler</button>}</div></form>
    <div className="table-wrap"><table><thead><tr><th>Nom</th><th>E-mail</th><th>Téléphone</th><th>Rôle</th><th>Actions</th></tr></thead><tbody>{users.map((item) => <tr key={item._id}><td>{item.prenom} {item.nom}</td><td>{item.email}</td><td>{item.telephone || "—"}</td><td>{item.role === "admin" ? "Administrateur" : "Utilisateur"}</td><td><button onClick={() => startEdit(item)}>Modifier</button><button className="danger-text-button" onClick={() => remove(item)}>Supprimer</button></td></tr>)}</tbody></table></div>
  </section>;
>>>>>>> origin/notification
}
