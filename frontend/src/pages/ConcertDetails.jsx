import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function PhotoCarousel({ photos, title }) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const photo = photos[current];

  function move(direction) {
    setCurrent((index) => (index + direction + photos.length) % photos.length);
  }

  function handleTouchStart(event) {
    setTouchStart(event.changedTouches[0].clientX);
  }

  function handleTouchEnd(event) {
    if (touchStart === null || photos.length < 2) return;
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) > 35) move(distance < 0 ? 1 : -1);
    setTouchStart(null);
  }

  return <div className="detail-carousel" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
    <div className="detail-carousel-image"><img src={photo} alt={`${title} ${current + 1}`} /></div>
    {photos.length > 1 && <>
      <button className="carousel-arrow carousel-prev" type="button" aria-label="Photo précédente" onClick={() => move(-1)}>‹</button>
      <button className="carousel-arrow carousel-next" type="button" aria-label="Photo suivante" onClick={() => move(1)}>›</button>
      <div className="carousel-dots">{photos.map((item, index) => <i className={index === current ? "active" : ""} key={item} />)}</div>
    </>}
  </div>;
}

export default function ConcertDetails() {
  const { id } = useParams(); const { user } = useAuth(); const [data, setData] = useState(null);
  useEffect(() => { api.get(`/concert/${id}`).then(({ data: result }) => setData(result)); }, [id]);
  if (!data) return <div className="page-state">Chargement...</div>;
  const available = data.categories.reduce((sum, category) => sum + category.quantiteRestante, 0);
  const photos = data.concert.photos?.length ? data.concert.photos : (data.concert.affiche ? [data.concert.affiche] : []);
  return <section className="detail-page"><div className="detail-hero"><div><p className="eyebrow">CONCERT</p><h1>{data.concert.titre}</h1><p>{data.concert.artiste ? `Avec ${data.concert.artiste} — ` : ""}{data.concert.description}</p></div></div>{photos.length > 0 && <PhotoCarousel photos={photos} title={data.concert.titre} />}<div className="detail-content"><div><p className="muted">{new Date(data.concert.date).toLocaleString("fr-FR")} · {data.concert.lieu}</p><p>{available ? `${available} places disponibles` : "Concert complet"}</p></div><div className="category-grid">{data.categories.map((category) => <article className={`category-card ${!category.quantiteRestante ? "full" : ""}`} key={category._id}><h3>{category.nom}</h3><strong>{category.prix} DT</strong><p>{category.quantiteRestante ? `${category.quantiteRestante} places restantes` : "Complet"}</p></article>)}</div><Link className="button" to={user ? `/reserver?concert=${id}` : `/login?redirect=/reserver?concert=${id}`}>Réserver maintenant →</Link></div></section>;
}
