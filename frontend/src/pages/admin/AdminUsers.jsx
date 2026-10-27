import { useEffect, useState } from "react";
import api from "../../api/axios";

const emptyUser = { nom: "", prenom: "", email: "", telephone: "", motDePasse: "", role: "user" };

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function load() {
    return api.get("/admin/users").then(({ data }) => setUsers(data));
  }
  useEffect(() => { load().catch((err) => setError(err.response?.data?.message || "Impossible de charger les utilisateurs.")); }, []);
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  function startEdit(user) { setEditing(user._id); setForm({ ...user, motDePasse: "" }); setError(""); setSuccess(""); }
  function reset() { setEditing(null); setForm(emptyUser); }
  async function submit(event) {
    event.preventDefault(); setError(""); setSuccess("");
    try {
      const { data } = editing
        ? await api.put(`/admin/users/${editing}`, form)
        : await api.post("/admin/users", form);
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
}
