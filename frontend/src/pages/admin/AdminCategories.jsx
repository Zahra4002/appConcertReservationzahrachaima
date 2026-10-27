import { useEffect, useState } from "react";
import api from "../../api/axios";
import Modal from "../../components/Modal";

const emptyConcert = {
  titre: "", artiste: "", date: "", heure: "", lieu: "", affiche: "",
  photos: [], description: "", dateLimiteAnnulation: "",
};
const ticketTypes = ["Standard", "Premium", "VIP"];

function formatConcert(concert) {
  return {
    ...concert,
    photos: concert.photos?.length ? concert.photos : (concert.affiche ? [concert.affiche] : []),
    date: concert.date ? concert.date.slice(0, 10) : "",
    dateLimiteAnnulation: concert.dateLimiteAnnulation
      ? new Date(concert.dateLimiteAnnulation).toISOString().slice(0, 16) : "",
  };
}

export default function AdminCategories() {
  const [concerts, setConcerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState("");
  const [concert, setConcert] = useState(emptyConcert);
  const [newConcert, setNewConcert] = useState(emptyConcert);
  const [category, setCategory] = useState({ concert: "", nom: "", prix: "", quantiteTotale: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function load() {
    return Promise.all([api.get("/concert/all"), api.get("/categories")]).then(([cs, cats]) => {
      setConcerts(cs.data);
      setCategories(cats.data);
      if (cs.data[0]) {
        setSelected(cs.data[0]._id);
        setCategory((current) => ({ ...current, concert: cs.data[0]._id }));
        setConcert(formatConcert(cs.data[0]));
      }
    });
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || "Impossible de charger les concerts et les catégories."));
  }, []);

  function selectImages(event, target) {
    const files = [...(event.target.files || [])];
    if (!files.length) return;
    const invalid = files.find((file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024);
    if (invalid) return setError("Chaque image doit être valide et ne pas dépasser 5 Mo.");
    const readPhotos = Promise.all(files.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    })));
    readPhotos.then((photos) => {
      const update = target === "new" ? setNewConcert : setConcert;
      update((current) => {
      const currentPhotos = target === "new" ? [] : (current.photos || (current.affiche ? [current.affiche] : []));
      const allPhotos = [...new Set([...currentPhotos, ...photos])];
      return {
        ...current, photos: allPhotos, affiche: allPhotos[0] || current.affiche,
      };
      });
    }).catch(() => setError("Impossible de lire les images."));
    event.target.value = "";
  }

  function removeConcertPhoto(photoToRemove) {
    setConcert((current) => {
      const photos = (current.photos || []).filter((photo) => photo !== photoToRemove);
      return { ...current, photos, affiche: photos[0] || "" };
    });
  }

  async function addConcert(event) {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/concert", { ...newConcert, dateLimiteAnnulation: newConcert.dateLimiteAnnulation || null });
      setConcerts([...concerts, data]);
      setSelected(data._id);
      setNewConcert(emptyConcert);
      setConcert(formatConcert(data));
      setSuccess("Le concert a été créé avec succès.");
    } catch (err) {
      setError(err.response?.data?.message || "Création impossible.");
    }
  }

  async function updateConcert(event) {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.put(`/concert/${selected}`, { ...concert, dateLimiteAnnulation: concert.dateLimiteAnnulation || null });
      setConcerts(concerts.map((item) => item._id === data._id ? data : item));
      setConcert(formatConcert(data));
      setSuccess("Le concert a été modifié avec succès.");
    } catch (err) {
      setError(err.response?.data?.message || "Modification impossible.");
    }
  }

  async function addCategory(event) {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/categories", { ...category, prix: Number(category.prix), quantiteTotale: Number(category.quantiteTotale) });
      setCategories([...categories, data]);
      setCategory({ concert: category.concert, nom: "", prix: "", quantiteTotale: "" });
      setSuccess("Le type de ticket a été ajouté avec succès.");
    } catch (err) {
      setError(err.response?.data?.message || "Création impossible.");
    }
  }

  async function removeCategory(id) {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    setError("");
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter((item) => item._id !== id));
      setSuccess("Le type de ticket a été supprimé avec succès.");
    } catch (err) {
      setError(err.response?.data?.message || "Suppression impossible.");
    }
  }

  async function updateCategory(event) {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.put(`/categories/${editingCategory._id}`, {
        nom: editingCategory.nom,
        prix: Number(editingCategory.prix),
        quantiteTotale: Number(editingCategory.quantiteTotale),
      });
      setCategories(categories.map((item) => item._id === data._id ? data : item));
      setEditingCategory(null);
      setSuccess("Le type de ticket a été modifié avec succès.");
    } catch (err) {
      setError(err.response?.data?.message || "Modification impossible.");
    }
  }

  async function removeConcert() {
    if (!selected) return;
    const current = concerts.find((item) => item._id === selected);
    if (!window.confirm(`Supprimer le concert « ${current?.titre || "sélectionné"} » ? Cette action supprimera aussi ses tickets, ses places et ses réservations.`)) return;
    setError("");
    try {
      await api.delete(`/concert/${selected}`);
      const remaining = concerts.filter((item) => item._id !== selected);
      setConcerts(remaining);
      setCategories(categories.filter((item) => item.concert !== selected && item.concert?._id !== selected));
      setSelected(remaining[0]?._id || "");
      setConcert(remaining[0] ? formatConcert(remaining[0]) : emptyConcert);
      setSuccess("Le concert a été supprimé avec succès.");
    } catch (err) {
      setError(err.response?.data?.message || `Suppression impossible (${err.message}).`);
    }
  }

  return <section className="section admin-page">
    <p className="eyebrow">CONFIGURATION</p>
    <h2>Concerts et types de tickets</h2>
    {error && <p className="error-text">{error}</p>}
    {success && <p className="success-message" role="status">{success}</p>}

    <form className="admin-form" onSubmit={addConcert}>
      <h3>Ajouter un concert</h3>
      <div className="form-row">
        <input placeholder="Titre" required value={newConcert.titre} onChange={(e) => setNewConcert({ ...newConcert, titre: e.target.value })} />
        <input placeholder="Artiste" value={newConcert.artiste} onChange={(e) => setNewConcert({ ...newConcert, artiste: e.target.value })} />
        <input type="date" required value={newConcert.date} onChange={(e) => setNewConcert({ ...newConcert, date: e.target.value })} />
        <input type="time" value={newConcert.heure} onChange={(e) => setNewConcert({ ...newConcert, heure: e.target.value })} />
        <input placeholder="Lieu" required value={newConcert.lieu} onChange={(e) => setNewConcert({ ...newConcert, lieu: e.target.value })} />
      </div>
      <div className="form-row">
        <label className="file-input"><span>Photos du concert</span><span className="file-button">＋ Importer des images</span><input type="file" accept="image/*" multiple onChange={(e) => selectImages(e, "new")} /></label>
        <div className="image-previews">{newConcert.photos.map((photo) => <img className="image-preview" src={photo} alt="Aperçu du concert" key={photo} />)}</div>
        <label>Date limite d'annulation><input type="datetime-local" value={newConcert.dateLimiteAnnulation} onChange={(e) => setNewConcert({ ...newConcert, dateLimiteAnnulation: e.target.value })} /></label>
        <button className="button">Créer le concert</button>
      </div>
      <textarea placeholder="Description" value={newConcert.description} onChange={(e) => setNewConcert({ ...newConcert, description: e.target.value })} />
    </form>

    <label className="select-label">Concert
      <select value={selected} onChange={(e) => { const item = concerts.find((concertItem) => concertItem._id === e.target.value); setSelected(e.target.value); if (item) setConcert(formatConcert(item)); }}>
        {concerts.map((item) => <option key={item._id} value={item._id}>{item.titre}</option>)}
      </select>
    </label>

    {selected && <form className="admin-form" onSubmit={updateConcert}>
      <h3>Modifier le concert sélectionné</h3>
      <div className="form-row">
        <input placeholder="Titre" required value={concert.titre} onChange={(e) => setConcert({ ...concert, titre: e.target.value })} />
        <input placeholder="Artiste" value={concert.artiste} onChange={(e) => setConcert({ ...concert, artiste: e.target.value })} />
        <input type="date" required value={concert.date} onChange={(e) => setConcert({ ...concert, date: e.target.value })} />
        <input type="time" value={concert.heure} onChange={(e) => setConcert({ ...concert, heure: e.target.value })} />
        <input placeholder="Lieu" required value={concert.lieu} onChange={(e) => setConcert({ ...concert, lieu: e.target.value })} />
      </div>
      <div className="form-row">
        <label className="file-input"><span>Photos du concert</span><span className="file-button">＋ Importer des images</span><input type="file" accept="image/*" multiple onChange={(e) => selectImages(e, "edit")} /></label>
        <div className="image-previews">{(concert.photos || (concert.affiche ? [concert.affiche] : [])).map((photo) => <div className="image-preview-item" key={photo}><img className="image-preview" src={photo} alt="Aperçu du concert" /><button type="button" className="remove-image-button" aria-label="Supprimer cette image" onClick={() => removeConcertPhoto(photo)}>×</button></div>)}</div>
        <label>Date limite d'annulation><input type="datetime-local" value={concert.dateLimiteAnnulation} onChange={(e) => setConcert({ ...concert, dateLimiteAnnulation: e.target.value })} /></label>
        <button className="button">Enregistrer les modifications</button>
      </div>
      <textarea placeholder="Description" value={concert.description} onChange={(e) => setConcert({ ...concert, description: e.target.value })} />
    </form>}

    <button type="button" className="danger-button concert-delete" onClick={removeConcert}>Supprimer ce concert</button>
    <form className="admin-form" onSubmit={addCategory}>
      <h3>Créer un type de ticket</h3>
      <div className="form-row">
        <select required value={category.concert} onChange={(e) => setCategory({ ...category, concert: e.target.value })}>
          <option value="">Sélectionner un concert</option>
          {concerts.map((item) => <option key={item._id} value={item._id}>{item.titre}</option>)}
        </select>
        <select required value={category.nom} onChange={(e) => setCategory({ ...category, nom: e.target.value })}>
          <option value="">Sélectionner un type</option>
          {ticketTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <input type="number" min="0" step="0.01" placeholder="Prix DT" required value={category.prix} onChange={(e) => setCategory({ ...category, prix: e.target.value })} />
        <input type="number" min="1" placeholder="Nombre de places" required value={category.quantiteTotale} onChange={(e) => setCategory({ ...category, quantiteTotale: e.target.value })} />
        <button className="button">Ajouter</button>
      </div>
    </form>
    <div className="table-wrap"><table><thead><tr><th>Type</th><th>Prix</th><th>Total</th><th>Restantes</th><th>Action</th></tr></thead><tbody>{categories.filter((item) => item.concert === selected || item.concert?._id === selected).map((item) => <tr key={item._id}><td>{item.nom}</td><td>{item.prix} DT</td><td>{item.quantiteTotale}</td><td>{item.quantiteRestante}</td><td><button onClick={() => setEditingCategory({ ...item })}>Modifier</button><button onClick={() => removeCategory(item._id)}>Supprimer</button></td></tr>)}</tbody></table></div>
    {editingCategory && <Modal title="Modifier le type de ticket" close={() => setEditingCategory(null)}><form className="form-grid" onSubmit={updateCategory}><label>Type<input required value={editingCategory.nom} onChange={(event) => setEditingCategory({ ...editingCategory, nom: event.target.value })} /></label><label>Prix (DT)<input type="number" min="0" step="0.01" required value={editingCategory.prix} onChange={(event) => setEditingCategory({ ...editingCategory, prix: event.target.value })} /></label><label>Nombre total de places<input type="number" min={Math.max(1, editingCategory.quantiteTotale - editingCategory.quantiteRestante)} required value={editingCategory.quantiteTotale} onChange={(event) => setEditingCategory({ ...editingCategory, quantiteTotale: event.target.value })} /></label><small className="muted">Places déjà réservées : {editingCategory.quantiteTotale - editingCategory.quantiteRestante}. Le total ne peut pas être inférieur à ce nombre.</small><button className="button" type="submit">Enregistrer</button></form></Modal>}
  </section>;
}
