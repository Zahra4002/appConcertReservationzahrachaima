import { useEffect, useState } from "react";
import api from "../../api/axios";
import Modal from "../../components/Modal";
export default function AdminReservations() {
  const [items, setItems] = useState([]); const [q, setQ] = useState(""); const [statut, setStatut] = useState("");
  const [editing, setEditing] = useState(null); const [error, setError] = useState("");
  useEffect(() => { api.get(`/admin/reservations?${new URLSearchParams({ ...(q && { q }), ...(statut && { statut }) })}`).then(({ data }) => setItems(data)); }, [q, statut]);
  async function remove(id) { if (!window.confirm("Supprimer cette réservation ?")) return; await api.delete(`/admin/reservations/${id}`); setItems(items.filter((item) => item._id !== id)); }
  async function saveEdit(event) {
    event.preventDefault(); setError("");
    try {
      const { data } = await api.put(`/admin/reservations/${editing._id}`, {
        quantite: Number(editing.quantite), statut: editing.statut,
      });
      setItems(items.map((entry) => entry._id === data._id ? { ...entry, ...data } : entry));
      setEditing(null);
    } catch (err) { setError(err.response?.data?.message || "Modification impossible."); }
  }
  return <section className="section admin-page"><p className="eyebrow">GESTION</p><h2>Réservations et acheteurs</h2><div className="filters"><input placeholder="Nom, e-mail ou code" value={q} onChange={(e) => setQ(e.target.value)} /><select value={statut} onChange={(e) => setStatut(e.target.value)}><option value="">Tous les statuts</option><option value="confirmee">Confirmée</option><option value="annulee">Annulée</option></select></div><div className="table-wrap"><table><thead><tr><th>Code</th><th>Acheteur</th><th>E-mail</th><th>Concert</th><th>Type de ticket</th><th>Places</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item._id}><td>{item.codeTicket}</td><td>{item.utilisateur?.prenom} {item.utilisateur?.nom}</td><td>{item.utilisateur?.email}</td><td>{item.categorie?.concert?.titre || "Concert inconnu"}</td><td>{item.categorie?.nom}</td><td>{item.quantite}</td><td><span className={`status ${item.statut}`}>{item.statut === "confirmee" ? "Confirmée" : "Annulée"}</span></td><td><button onClick={() => { setError(""); setEditing({ ...item }); }}>Modifier</button><button onClick={() => remove(item._id)}>Supprimer</button></td></tr>)}</tbody></table></div>
    {editing && <Modal title="Modifier la réservation" close={() => setEditing(null)}><form className="form-grid" onSubmit={saveEdit}><label>Nombre de places<input type="number" min="1" max="6" required value={editing.quantite} onChange={(event) => setEditing({ ...editing, quantite: event.target.value })} /></label><label>Statut<select value={editing.statut} onChange={(event) => setEditing({ ...editing, statut: event.target.value })}><option value="confirmee">Confirmée</option><option value="annulee">Annulée</option></select></label>{error && <p className="error-text">{error}</p>}<button className="button" type="submit">Enregistrer</button></form></Modal>}
  </section>;
}
