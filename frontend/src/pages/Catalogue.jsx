import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function ConcertImageCarousel({ concert, available }) {
  const photos = concert.photos?.length ? concert.photos : (concert.affiche ? [concert.affiche] : []);
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const photo = photos[current];

  function changePhoto(event, direction) {
    event.preventDefault();
    event.stopPropagation();
    setCurrent((index) => (index + direction + photos.length) % photos.length);
  }

  function handleTouchStart(event) {
    setTouchStart(event.changedTouches[0].clientX);
  }

  function handleTouchEnd(event) {
    if (touchStart === null || photos.length < 2) return;
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) > 35) setCurrent((index) => (index + (distance < 0 ? 1 : -1) + photos.length) % photos.length);
    setTouchStart(null);
  }

  return <div className="concert-image-carousel" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
    <div className="concert-image" style={photo ? { backgroundImage: `url(${photo})` } : {}}>
      <span className={available ? "catalog-availability is-available" : "catalog-availability is-unavailable"}>{available ? "Disponible" : "Non disponible"}</span>
    </div>
    {photos.length > 1 && <>
      <button className="carousel-arrow carousel-prev" type="button" aria-label="Photo précédente" onClick={(event) => changePhoto(event, -1)}>‹</button>
      <button className="carousel-arrow carousel-next" type="button" aria-label="Photo suivante" onClick={(event) => changePhoto(event, 1)}>›</button>
      <div className="carousel-dots">{photos.map((item, index) => <i className={index === current ? "active" : ""} key={item} />)}</div>
    </>}
  </div>;
}

export default function Catalogue() {
  const [concerts, setConcerts] = useState(null);
  useEffect(() => { api.get("/concert/catalog").then(({ data }) => setConcerts(data)).catch(() => setConcerts([])); }, []);
  if (!concerts) return <div className="page-state">Chargement des concerts...</div>;
  return <section className="section"><div className="page-intro"><p className="eyebrow">PROGRAMMATION</p><h2>Tous les concerts</h2><p className="muted">Choisissez votre événement et réservez vos places.</p></div><div className="concert-grid">{concerts.map((concert) => {
    const available = concert.categories.reduce((sum, category) => sum + category.quantiteRestante, 0);
    return <Link className="concert-card" to={`/concerts/${concert._id}`} key={concert._id}><ConcertImageCarousel concert={concert} available={available} /><p className="eyebrow">{new Date(concert.date).toLocaleDateString("fr-FR")} · {concert.heure || "Horaire à venir"}</p><h3>{concert.titre}</h3><p className="muted">{concert.artiste ? `${concert.artiste} · ` : ""}{concert.lieu}</p></Link>;
  })}</div>{!concerts.length && <div className="empty">Aucun concert disponible.</div>}</section>;
}
