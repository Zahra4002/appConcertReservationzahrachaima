import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function MyReservations() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  async function load() {
    const { data } = await api.get("/reservations/mine");
    setItems(data);
  }

  useEffect(() => {
    load().catch(() => setError("Impossible de charger vos réservations."));
  }, []);

  async function cancel(id) {
    if (!window.confirm("Annuler cette réservation ?")) return;

    setError("");
    setCancellingId(id);
    try {
      await api.put(`/reservations/${id}/cancel`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Annulation impossible.");
    } finally {
      setCancellingId("");
    }
  }

  if (!items) return <div className="page-state">Chargement...</div>;

  return <section className="section narrow">
    <div className="page-intro">
      <p className="eyebrow">VOTRE ESPACE</p>
      <h2>Mes réservations</h2>
      {error && <p className="error-text">{error}</p>}
    </div>
    <div className="reservation-grid">
      {items.map((item) => {
        const deadline = item.categorie?.concert?.dateLimiteAnnulation;
        const canCancel = item.statut === "confirmee"
          && (!deadline || new Date() <= new Date(deadline));
        const isCancelling = cancellingId === item._id;

        return <article className="reservation-card" key={item._id}>
          <div>
            <span className={`status ${item.statut}`}>
              {item.statut === "confirmee" ? "Confirmée" : "Annulée"}
            </span>
            <h3>{item.categorie?.concert?.titre || item.categorie?.nom}</h3>
            <p>{item.quantite} place(s) · {item.codeTicket}</p>
            <small>
              {deadline
                ? `Annulation jusqu'au ${new Date(deadline).toLocaleString("fr-FR")}`
                : "Annulation autorisée"}
            </small>
          </div>
          <div className="reservation-actions">
            <Link className="outline-button" to={`/ticket/${item._id}`}>
              Voir le ticket
            </Link>
            <button
              className="danger-button"
              type="button"
              disabled={!canCancel || isCancelling}
              onClick={() => cancel(item._id)}
            >
              {isCancelling ? "Annulation..." : canCancel ? "Annuler" : "Annulation indisponible"}
            </button>
          </div>
        </article>;
      })}
    </div>
    {!items.length && <div className="empty">Aucune réservation pour le moment.</div>}
  </section>;
}
