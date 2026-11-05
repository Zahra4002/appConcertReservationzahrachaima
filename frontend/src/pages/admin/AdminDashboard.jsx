import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const colors = ["#cf8cf2", "#58bf8b", "#f29b9b", "#78a9e8", "#f2c879", "#9e8cf2"];

function SalesChart({ categories }) {
  const total = categories.reduce((sum, item) => sum + item.vendus, 0);
  let cursor = 0;
  const segments = categories.map((item, index) => {
    const start = cursor;
    cursor += total ? (item.vendus / total) * 100 : 0;
    return `${colors[index % colors.length]} ${start}% ${cursor}%`;
  }).join(", ");

  return <div className="chart-card">
    <h3>Répartition des ventes</h3>
    <div className="pie-layout">
      <div className="pie-chart" style={{ background: total ? `conic-gradient(${segments})` : "#3b3343" }}>
        <span>{total}<small>tickets vendus</small></span>
      </div>
      <div className="pie-legend">
        {categories.map((item, index) => <div className="legend-item" key={item.nom}>
          <i style={{ background: colors[index % colors.length] }} />
          <span>{item.nom}</span>
          <b>{item.vendus} ({total ? Math.round(item.vendus / total * 100) : 0}%)</b>
        </div>)}
      </div>
    </div>
    {!total && <p className="muted">Aucune vente enregistrée pour le moment.</p>}
  </div>;
}

function UsersChart({ stats }) {
  const roles = stats.utilisateursParRole || { utilisateurs: stats.utilisateurs, administrateurs: 0 };
  const total = roles.utilisateurs + roles.administrateurs;
  const values = [
    ["Utilisateurs", roles.utilisateurs, "#58bf8b"],
    ["Administrateurs", roles.administrateurs, "#cf8cf2"],
  ];
  return <div className="chart-card users-chart">
    <h3>Utilisateurs par type</h3>
    <p className="muted">{total} comptes au total</p>
    <div className="user-bars">
      {values.map(([label, value, color]) => <div className="user-bar" key={label}>
        <div className="user-bar-heading">
          <span>{label}</span>
          <b>{total ? Math.round(value / total * 100) : 0}%</b>
        </div>
        <div className="user-bar-track">
          <i style={{ width: `${total ? value / total * 100 : 0}%`, background: color }} />
        </div>
        <small>{value} compte{value > 1 ? "s" : ""}</small>
      </div>)}
    </div>
  </div>;
}

function PopularConcertsChart({ concerts }) {
  const max = Math.max(1, ...concerts.map((item) => item.reservations));
  return <div className="chart-card popular-chart">
    <h3>Concerts les plus populaires</h3>
    <p className="muted">Classement selon les réservations confirmées</p>
    {concerts.length ? <div className="popular-bars">
      {concerts.map((item, index) => <div className="popular-bar" key={item._id}>
        <div className="popular-bar-heading">
          <span><b>{index + 1}</b>{item.titre}</span>
          <strong>{item.reservations} réservation{item.reservations > 1 ? "s" : ""}</strong>
        </div>
        <div className="popular-bar-track"><i style={{ width: `${item.reservations / max * 100}%` }} /></div>
        <small>{item.tickets} ticket{item.tickets > 1 ? "s" : ""} réservé{item.tickets > 1 ? "s" : ""}</small>
      </div>)}
    </div> : <p className="muted">Aucun concert disponible pour le moment.</p>}
  </div>;
}

function RevenueConcertsChart({ concerts }) {
  const max = Math.max(1, ...concerts.map((item) => item.revenus));
  const totalRevenue = concerts.reduce((sum, item) => sum + item.revenus, 0);
  return <div className="chart-card popular-chart">
    <h3>Concerts les plus rentables</h3>
    <p className="muted">Revenus calculés à partir des réservations confirmées · Total : <strong>{totalRevenue.toLocaleString("fr-FR")} DT</strong></p>
    {concerts.length ? <div className="revenue-columns">
      {concerts.map((item, index) => <article className={`revenue-column revenue-rank-${index + 1}`} key={item._id}>
        <strong className="revenue-amount">{item.revenus.toLocaleString("fr-FR")} DT</strong>
        <div className="revenue-column-track"><i style={{ height: `${item.revenus / max * 100}%` }} /></div>
        <span className="revenue-column-rank">#{index + 1}</span>
        <h4 title={item.titre}>{item.titre}</h4>
        <small>{item.tickets} ticket{item.tickets > 1 ? "s" : ""} · {item.reservations} réservation{item.reservations > 1 ? "s" : ""}</small>
      </article>)}
    </div> : <p className="muted">Aucune réservation confirmée avec un concert associé.</p>}
  </div>;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <div className="page-state">Chargement...</div>;
  const hour = new Date().getHours();
  const greeting = hour >= 18 ? "Bonsoir" : "Bonjour";
  const adminName = user?.prenom || user?.nom || "Admin";
  const statCards = [
    ["Réservations", stats.reservationsConfirmees],
    ["Tickets vendus", stats.ticketsVendus],
    ["Places restantes", stats.placesRestantes],
    ["Utilisateurs", stats.utilisateurs],
  ];

  return <section className="section admin-page">
    <div className="dashboard-welcome">
      <p className="eyebrow">ESPACE ADMINISTRATEUR</p>
      <h1>{greeting}, {adminName} <span>✦</span></h1>
      <p className="muted">Voici un aperçu de l’activité de votre plateforme.</p>
    </div>
    <h2 className="dashboard-section-title">Vue d'ensemble</h2>
    <div className="stats-grid">
      {statCards.map(([label, value]) => <div className="stat-card" key={label}>
        <span>{label}</span><strong>{value}</strong>
      </div>)}
    </div>
    <div className="dashboard-charts">
      <SalesChart categories={stats.parCategorie} />
      <UsersChart stats={stats} />
    </div>
    <PopularConcertsChart concerts={stats.concertsPopulaires || []} />
    <RevenueConcertsChart concerts={stats.concertsRentables || []} />
  </section>;
}
