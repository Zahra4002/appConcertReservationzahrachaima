import { StrictMode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, NavLink, Navigate, Outlet, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import api from "./api/axios";
import "./styles.css";

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("concert_user") || "null"));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("concert_token")));
  useEffect(() => {
    if (!localStorage.getItem("concert_token")) return setLoading(false);
    api.get("/auth/me").then(({ data }) => setUser(data)).catch(() => logout()).finally(() => setLoading(false));
  }, []);
  function save(data) {
    localStorage.setItem("concert_token", data.token);
    localStorage.setItem("concert_user", JSON.stringify(data.user));
    setUser(data.user);
  }
  async function login(values) { const { data } = await api.post("/auth/login", values); save(data); }
  async function register(values) { const { data } = await api.post("/auth/register", values); save(data); }
  function logout() { localStorage.removeItem("concert_token"); localStorage.removeItem("concert_user"); setUser(null); }
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

function Layout() {
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState(false);
  const nav = useNavigate();
  const links = user?.role === "admin"
    ? [["/admin", "Dashboard"], ["/admin/reservations", "Réservations"], ["/admin/users", "Utilisateurs"], ["/admin/categories", "Catégories"]]
    : user ? [["/", "À propos"], ["/reserver", "Réserver"], ["/mes-reservations", "Mes réservations"]] : [["/", "À propos"], ["/login", "Connexion"], ["/register", "Inscription"]];
  return <div className="app-shell">
    <header className="navbar"><Link to="/" className="brand">Concertia</Link><button className="burger" onClick={() => setMenu(!menu)}>☰</button>
      <nav className={menu ? "nav-links open" : "nav-links"}>{links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setMenu(false)} className={({ isActive }) => isActive ? "active" : ""}>{label}</NavLink>)}{user && <button className="text-button" onClick={() => { logout(); nav("/"); }}>Déconnexion</button>}</nav>
    </header>
    <main className="main-content"><Outlet /></main>
    <footer><strong>Concertia</strong><span>contact@concertia.tn</span><span>Réalisatrices : Zahra Chebbi & Chaima Dhouibi</span></footer>
  </div>;
}

function Protected({ admin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-state">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}

function useRequest() {
  const [state, setState] = useState({ loading: false, error: "" });
  async function run(action) {
    setState({ loading: true, error: "" });
    try { return await action(); } catch (err) { setState({ loading: false, error: err.response?.data?.message || "Une erreur est survenue." }); throw err; }
    finally { setState((s) => ({ ...s, loading: false })); }
  }
  return { ...state, run };
}

function Home() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/concert").then(({ data: result }) => setData(result)).catch(() => setData({ error: "Concert indisponible" })); }, []);
  if (!data) return <div className="page-state">Chargement du concert...</div>;
  if (data.error) return <div className="page-state error-text">{data.error}</div>;
  const { concert, categories } = data;
  return <div className="home-page">
    <section className="concert-hero"><div><p className="eyebrow">ÉVÉNEMENT EXCLUSIF · 20 DÉCEMBRE 2026</p><h1>{concert.titre}<br /><em>en live.</em></h1><p>{concert.description}</p><Link className="button" to="/reserver">Réserver maintenant <span>→</span></Link></div><div className="poster"><span>LIVE</span><b>{concert.titre}</b><small>{concert.lieu} · {concert.heure}</small></div></section>
    <section className="section"><div className="section-heading"><div><p className="eyebrow">L'EXPÉRIENCE</p><h2>Choisissez votre place.</h2></div><p>{concert.programme?.join(" · ")}</p></div><div className="category-grid">{categories.map((cat) => <CategoryCard key={cat._id} category={cat} />)}</div></section>
  </div>;
}

function CategoryCard({ category }) {
  const full = category.quantiteRestante === 0;
  return <article className={`category-card ${full ? "full" : ""}`}><span className="category-dot" /><h3>{category.nom}</h3><strong>{category.prix} DT</strong><p>{full ? "Complet" : `${category.quantiteRestante} places restantes`}</p></article>;
}

function AuthForm({ type }) {
  const isLogin = type === "login"; const { login, register } = useAuth(); const nav = useNavigate(); const request = useRequest();
  const [form, setForm] = useState(isLogin ? { email: "", motDePasse: "" } : { nom: "", prenom: "", email: "", telephone: "", motDePasse: "" });
  const [errors, setErrors] = useState({});
  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: "" }); }
  async function submit(e) { e.preventDefault(); const next = {}; Object.entries(form).forEach(([key, value]) => { if (!value && key !== "telephone") next[key] = "Ce champ est obligatoire."; }); if (form.motDePasse && form.motDePasse.length < 6) next.motDePasse = "6 caractères minimum."; if (Object.keys(next).length) return setErrors(next); try { await request.run(() => isLogin ? login(form) : register(form)); nav(isLogin ? "/" : "/"); } catch {} }
  const fields = isLogin ? [["email", "E-mail", "email"], ["motDePasse", "Mot de passe", "password"]] : [["nom", "Nom"], ["prenom", "Prénom"], ["email", "E-mail", "email"], ["telephone", "Téléphone"], ["motDePasse", "Mot de passe", "password"]];
  return <div className="auth-page"><div className="auth-card"><p className="eyebrow">{isLogin ? "BON RETOUR" : "BIENVENUE"}</p><h2>{isLogin ? "Connexion" : "Créer un compte"}</h2><p className="muted">{isLogin ? "Accédez à vos réservations." : "Réservez votre expérience musicale."}</p><form onSubmit={submit} className="form-grid">{fields.map(([name, label, typeInput = "text"]) => <label key={name}>{label}<input name={name} type={typeInput} value={form[name]} onChange={change} />{errors[name] && <small className="field-error">{errors[name]}</small>}</label>)}<button className="button full-button" disabled={request.loading}>{request.loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}</button>{request.error && <p className="error-text">{request.error}</p>}</form><p className="form-link">{isLogin ? <>Pas encore de compte ? <Link to="/register">Inscription</Link></> : <>Déjà inscrit ? <Link to="/login">Connexion</Link></>}</p></div></div>;
}

function Reserve() {
  const { user } = useAuth(); const nav = useNavigate(); const request = useRequest(); const [data, setData] = useState(null); const [category, setCategory] = useState(null); const [selected, setSelected] = useState([]);
  useEffect(() => { api.get("/concert").then(({ data: result }) => { setData(result); return api.get(`/reservations/plan/${result.concert._id}`); }).then(({ data: plan }) => setData((old) => ({ ...old, plan }))).catch(() => {}); }, []);
  if (!data?.plan) return <div className="page-state">Chargement du plan de salle...</div>;
  const seats = data.plan.places.filter((seat) => !category || seat.categorie?._id === category._id);
  const total = selected.reduce((sum, id) => { const seat = data.plan.places.find((item) => item.id === id); return sum + (seat?.categorie?.prix || 0); }, 0);
  function toggle(seat) { if (seat.statut !== "disponible") return; if (selected.includes(seat.id)) return setSelected(selected.filter((id) => id !== seat.id)); if (selected.length >= 6) return; if (category && seat.categorie?._id !== category._id) return; setSelected([...selected, seat.id]); setCategory(seat.categorie); }
  async function submit() { if (!category || !selected.length) return; try { const { data: result } = await request.run(() => api.post("/reservations", { categorie: category._id, quantite: selected.length, places: selected })); nav(`/ticket/${result._id}`); } catch {} }
  return <div className="reserve-page"><div className="page-intro"><p className="eyebrow">RÉSERVATION · {user.prenom}</p><h2>Choisissez vos places.</h2><p className="muted">Sélectionnez jusqu'à 6 sièges disponibles sur le plan.</p></div><div className="reserve-layout"><div><div className="category-tabs">{data.categories.map((cat) => <button key={cat._id} className={category?._id === cat._id ? "selected-tab" : ""} onClick={() => { setCategory(cat); setSelected([]); }}>{cat.nom}<small>{cat.prix} DT</small></button>)}</div><SeatMap seats={seats} selected={selected} onToggle={toggle} /></div><aside className="summary-card"><p className="eyebrow">VOTRE SÉLECTION</p><h3>{selected.length} place{selected.length > 1 ? "s" : ""}</h3><p className="muted">{category?.nom || "Choisissez une catégorie"}</p><div className="total-line"><span>Total</span><strong>{total} DT</strong></div><button className="button full-button" disabled={!selected.length || request.loading} onClick={submit}>{request.loading ? "Confirmation..." : "Continuer"}</button>{request.error && <p className="error-text">{request.error}</p>}</aside></div></div>;
}

function SeatMap({ seats, selected, onToggle }) {
  const rows = {}; seats.forEach((seat) => { (rows[seat.rangee] ||= []).push(seat); });
  return <section className="seat-map"><div className="stage">SCÈNE</div><div className="seat-legend"><span><i className="available" /> Disponible</span><span><i className="chosen" /> Sélectionnée</span><span><i className="occupied" /> Occupée</span></div>{Object.entries(rows).sort().map(([row, rowSeats]) => <div className="seat-row" key={row}><b>{row}</b>{rowSeats.sort((a, b) => a.numero - b.numero).map((seat) => <button key={seat.id} disabled={seat.statut !== "disponible"} className={`seat ${selected.includes(seat.id) ? "chosen" : seat.statut === "occupee" ? "occupied" : "available"}`} onClick={() => onToggle(seat)}>{seat.numero}</button>)}</div>)}</section>;
}

function MyReservations() {
  const [items, setItems] = useState(null); const [message, setMessage] = useState("");
  function load() { api.get("/reservations/mine").then(({ data }) => setItems(data)); }
  useEffect(load, []);
  async function cancel(id) { if (!window.confirm("Annuler cette réservation ?")) return; await api.put(`/reservations/${id}/cancel`); setMessage("Réservation annulée."); load(); }
  if (!items) return <div className="page-state">Chargement...</div>;
  return <div className="section narrow"><div className="page-intro"><p className="eyebrow">VOTRE ESPACE</p><h2>Mes réservations</h2>{message && <p className="success-text">{message}</p>}</div>{items.length ? <div className="reservation-grid">{items.map((item) => <article className="reservation-card" key={item._id}><div><span className={`status ${item.statut}`}>{item.statut === "confirmee" ? "Confirmée" : "Annulée"}</span><h3>{item.categorie?.nom}</h3><p>{item.quantite} place(s) · {item.codeTicket}</p><small>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</small></div><div className="card-actions"><Link className="outline-button" to={`/ticket/${item._id}`}>Voir le ticket</Link>{item.statut === "confirmee" && <button className="danger-button" onClick={() => cancel(item._id)}>Annuler</button>}</div></article>)}</div> : <div className="empty">Aucune réservation pour le moment.</div>}</div>;
}

function Ticket() {
  const { id } = useParams(); const [item, setItem] = useState(null);
  useEffect(() => { api.get("/reservations/mine").then(({ data }) => setItem(data.find((x) => x._id === id))); }, [id]);
  if (!item) return <div className="page-state">Chargement du ticket...</div>;
  return <div className="ticket-page"><div className="ticket-card"><p className="eyebrow">VOTRE E-TICKET</p><h2>{item.categorie?.nom} · Concertia</h2><div className="ticket-code">{item.codeTicket}</div><QRCodeCanvas value={`concertia:${item.codeTicket}`} size={180} includeMargin /><div className="ticket-details"><span>{item.quantite} place(s)</span><span>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</span><span className={`status ${item.statut}`}>{item.statut}</span></div><button className="outline-button" onClick={() => window.print()}>Télécharger en PDF</button></div></div>;
}

function AdminNav() { return <div className="admin-nav"><NavLink to="/admin">Vue d'ensemble</NavLink><NavLink to="/admin/reservations">Réservations</NavLink><NavLink to="/admin/users">Utilisateurs</NavLink><NavLink to="/admin/categories">Catégories</NavLink></div>; }
function Dashboard() { const [stats, setStats] = useState(null); useEffect(() => { api.get("/admin/stats").then(({ data }) => setStats(data)); }, []); if (!stats) return <div className="page-state">Chargement...</div>; return <div className="section admin-page"><AdminNav /><div className="page-intro"><p className="eyebrow">ADMINISTRATION</p><h2>Dashboard</h2></div><div className="stats-grid">{[["Réservations", stats.reservationsConfirmees], ["Tickets vendus", stats.ticketsVendus], ["Places restantes", stats.placesRestantes], ["Utilisateurs", stats.utilisateurs]].map(([label, value]) => <div className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="chart-card"><h3>Ventes par catégorie</h3>{stats.parCategorie.map((item) => <div className="bar-row" key={item.nom}><span>{item.nom}</span><div><i style={{ width: `${Math.min(100, item.vendus / Math.max(1, item.vendus + item.restantes) * 100)}%` }} /></div><b>{item.vendus} / {item.restantes}</b></div>)}</div></div>; }
function AdminReservations() { const [items, setItems] = useState([]); const [q, setQ] = useState(""); const [statut, setStatut] = useState(""); const [selected, setSelected] = useState(null); const [edit, setEdit] = useState(null); const [searchParams] = useSearchParams(); useEffect(() => { api.get(`/admin/reservations?${new URLSearchParams({ ...(q && { q }), ...(statut && { statut }) })}`).then(({ data }) => setItems(data)); }, [q, statut, searchParams]); async function remove(id) { if (!window.confirm("Supprimer cette réservation ?")) return; await api.delete(`/admin/reservations/${id}`); setItems(items.filter((x) => x._id !== id)); } async function save() { const { data } = await api.put(`/admin/reservations/${edit._id}`, { quantite: Number(edit.quantite), statut: edit.statut }); setItems(items.map((x) => x._id === data._id ? { ...x, ...data } : x)); setEdit(null); } return <div className="section admin-page"><AdminNav /><div className="page-intro"><p className="eyebrow">GESTION</p><h2>Réservations</h2></div><div className="filters"><input placeholder="Recherche nom/email/code" value={q} onChange={(e) => setQ(e.target.value)} /><select value={statut} onChange={(e) => setStatut(e.target.value)}><option value="">Tous les statuts</option><option value="confirmee">Confirmée</option><option value="annulee">Annulée</option></select></div><div className="table-wrap"><table><thead><tr><th>Code</th><th>Personne</th><th>Catégorie</th><th>Qté</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item._id} onClick={() => setSelected(item)}><td>{item.codeTicket}</td><td>{item.utilisateur?.prenom} {item.utilisateur?.nom}</td><td>{item.categorie?.nom}</td><td>{item.quantite}</td><td><span className={`status ${item.statut}`}>{item.statut}</span></td><td><button onClick={(e) => { e.stopPropagation(); setEdit({ ...item }); }}>✎</button><button onClick={(e) => { e.stopPropagation(); remove(item._id); }}>🗑</button></td></tr>)}</tbody></table></div>{selected && <Modal title="Détail de la réservation" close={() => setSelected(null)}><p><b>{selected.codeTicket}</b></p><p>{selected.utilisateur?.prenom} {selected.utilisateur?.nom} · {selected.utilisateur?.email}</p><p>{selected.quantite} place(s) · {selected.categorie?.nom}</p><button className="button" onClick={() => setSelected(null)}>Fermer</button></Modal>}{edit && <Modal title="Modifier la réservation" close={() => setEdit(null)}><label>Quantité<input type="number" min="1" max="6" value={edit.quantite} onChange={(e) => setEdit({ ...edit, quantite: e.target.value })} /></label><label>Statut<select value={edit.statut} onChange={(e) => setEdit({ ...edit, statut: e.target.value })}><option value="confirmee">Confirmée</option><option value="annulee">Annulée</option></select></label><button className="button" onClick={save}>Enregistrer</button></Modal>}</div>; }
function AdminUsers() { const [users, setUsers] = useState(null); useEffect(() => { api.get("/admin/users").then(({ data }) => setUsers(data)); }, []); if (!users) return <div className="page-state">Chargement...</div>; return <div className="section admin-page"><AdminNav /><h2>Utilisateurs</h2><div className="table-wrap"><table><thead><tr><th>Nom</th><th>E-mail</th><th>Téléphone</th><th>Rôle</th><th>Inscription</th></tr></thead><tbody>{users.map((item) => <tr key={item._id}><td>{item.prenom} {item.nom}</td><td>{item.email}</td><td>{item.telephone || "—"}</td><td>{item.role}</td><td>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</td></tr>)}</tbody></table></div></div>; }
function AdminCategories() {
  const [items, setItems] = useState(null);
  const [concerts, setConcerts] = useState([]);
  const [concert, setConcert] = useState(null);
  const [form, setForm] = useState({ nom: "", prix: "", quantiteTotale: "" });
  const [concertForm, setConcertForm] = useState({ titre: "", date: "", heure: "", lieu: "", description: "" });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const load = () => Promise.all([api.get("/categories"), api.get("/concert/all")]).then(([cats, concertsResult]) => {
    setItems(cats.data);
    setConcerts(concertsResult.data);
    setConcert((current) => current || concertsResult.data[0] || null);
  });
  useEffect(() => { load().catch((err) => setError(err.response?.data?.message || "Impossible de charger les données.")); }, []);
  async function addConcert(e) {
    e.preventDefault();
    try {
      const { data } = await api.post("/concert", concertForm);
      setConcerts([...concerts, data]); setConcert(data);
      setConcertForm({ titre: "", date: "", heure: "", lieu: "", description: "" });
    } catch (err) { setError(err.response?.data?.message || "Impossible de créer le concert."); }
  }
  async function addCategory(e) {
    e.preventDefault();
    if (!concert) return setError("Créez ou sélectionnez un concert.");
    try {
      const { data } = await api.post("/categories", { ...form, concert: concert._id, prix: Number(form.prix), quantiteTotale: Number(form.quantiteTotale) });
      setItems([...items, data]); setForm({ nom: "", prix: "", quantiteTotale: "" });
    } catch (err) { setError(err.response?.data?.message || "Impossible de créer la catégorie."); }
  }
  async function remove(id) { if (window.confirm("Supprimer cette catégorie ?")) { await api.delete(`/categories/${id}`); setItems(items.filter((x) => x._id !== id)); } }
  async function saveEdit() {
    const { data } = await api.put(`/categories/${editing._id}`, { nom: editing.nom, prix: Number(editing.prix), quantiteTotale: Number(editing.quantiteTotale) });
    setItems(items.map((item) => item._id === data._id ? data : item)); setEditing(null);
  }
  if (!items) return <div className="page-state">Chargement...</div>;
  const visibleItems = concert ? items.filter((item) => item.concert === concert._id || item.concert?._id === concert._id) : [];
  return <div className="section admin-page"><AdminNav /><h2>Concerts et catégories</h2>
    {error && <p className="error-text">{error}</p>}
    <form className="admin-form" onSubmit={addConcert}><h3>Créer un concert</h3><div className="form-row"><input placeholder="Titre" value={concertForm.titre} onChange={(e) => setConcertForm({ ...concertForm, titre: e.target.value })} required /><input type="date" value={concertForm.date} onChange={(e) => setConcertForm({ ...concertForm, date: e.target.value })} required /><input type="time" value={concertForm.heure} onChange={(e) => setConcertForm({ ...concertForm, heure: e.target.value })} /><input placeholder="Lieu" value={concertForm.lieu} onChange={(e) => setConcertForm({ ...concertForm, lieu: e.target.value })} required /><button className="button">Créer</button></div><textarea placeholder="Description" value={concertForm.description} onChange={(e) => setConcertForm({ ...concertForm, description: e.target.value })} /></form>
    <label className="select-label">Concert<select value={concert?._id || ""} onChange={(e) => setConcert(concerts.find((item) => item._id === e.target.value))}>{concerts.map((item) => <option key={item._id} value={item._id}>{item.titre} — {new Date(item.date).toLocaleDateString("fr-FR")}</option>)}</select></label>
    <form className="admin-form" onSubmit={addCategory}><h3>Ajouter des places</h3><div className="form-row"><input placeholder="Catégorie (VIP, Premium, Standard)" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /><input type="number" min="0" placeholder="Prix DT" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} required /><input type="number" min="1" placeholder="Nombre de places" value={form.quantiteTotale} onChange={(e) => setForm({ ...form, quantiteTotale: e.target.value })} required /><button className="button">Ajouter les places</button></div></form>
    <div className="table-wrap"><table><thead><tr><th>Nom</th><th>Prix</th><th>Total</th><th>Restantes</th><th>Actions</th></tr></thead><tbody>{visibleItems.map((item) => <tr key={item._id}><td>{item.nom}</td><td>{item.prix} DT</td><td>{item.quantiteTotale}</td><td>{item.quantiteRestante}</td><td><button onClick={() => setEditing({ ...item })}>✎</button><button onClick={() => remove(item._id)}>🗑</button></td></tr>)}</tbody></table></div>
    {editing && <Modal title={`Modifier ${editing.nom}`} close={() => setEditing(null)}><label>Nom<input value={editing.nom} onChange={(e) => setEditing({ ...editing, nom: e.target.value })} /></label><label>Prix<input type="number" min="0" value={editing.prix} onChange={(e) => setEditing({ ...editing, prix: e.target.value })} /></label><label>Total<input type="number" min="1" value={editing.quantiteTotale} onChange={(e) => setEditing({ ...editing, quantiteTotale: e.target.value })} /></label><button className="button" onClick={saveEdit}>Enregistrer</button></Modal>}
  </div>;
}
function Modal({ title, close, children }) { return <div className="modal-backdrop" onClick={close}><div className="modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={close}>×</button><h3>{title}</h3>{children}</div></div>; }

function App() { return <AuthProvider><Routes><Route element={<Layout />}><Route path="/" element={<Home />} /><Route path="/login" element={<AuthForm type="login" />} /><Route path="/register" element={<AuthForm type="register" />} /><Route element={<Protected />}><Route path="/reserver" element={<Reserve />} /><Route path="/ticket/:id" element={<Ticket />} /><Route path="/mes-reservations" element={<MyReservations />} /></Route><Route element={<Protected admin />}><Route path="/admin" element={<Dashboard />} /><Route path="/admin/reservations" element={<AdminReservations />} /><Route path="/admin/users" element={<AdminUsers />} /><Route path="/admin/categories" element={<AdminCategories />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes></AuthProvider>; }

createRoot(document.getElementById("root")).render(<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>);
