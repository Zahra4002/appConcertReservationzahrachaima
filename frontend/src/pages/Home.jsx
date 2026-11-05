import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import concertBackground from "../assets/concert.jpg";
import musicNote from "../assets/musicnote.png";
import musicDisc from "../assets/musicdisc.png";
import ticket from "../assets/ticket.jpg";

export default function Home() {
  const [concertSlides, setConcertSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    api.get("/concert/catalog").then(({ data }) => {
      setConcertSlides(data
        .map((concert) => ({
          id: concert._id,
          titre: concert.titre,
          photo: concert.photos?.[0] || concert.affiche || "",
        }))
        .filter((concert) => concert.photo));
    }).catch((error) => console.error("Impossible de charger la photo du concert :", error));
  }, []);

  useEffect(() => {
    if (concertSlides.length < 2) return undefined;
    const timer = setInterval(() => {
      setCurrentSlide((index) => (index + 1) % concertSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [concertSlides.length]);

  const currentConcert = concertSlides[currentSlide];

  return <section className="landing" style={{ "--concert-background": `url(${concertBackground})` }}>
    <img className="music-disc-decoration" src={musicDisc} alt="" aria-hidden="true" />
    <div>
      <p className="eyebrow">VIVEZ LA MUSIQUE EN DIRECT</p>
      <h1>Les meilleurs concerts,<br /><em>au premier rang.</em></h1>
      <p className="muted">Découvrez les concerts disponibles, choisissez vos places et recevez votre e-ticket immédiatement.</p>
      <Link className="button" to="/catalogue">Voir les concerts <span>→</span></Link>
    </div>
    <div className="home-concert-visual" style={currentConcert ? { backgroundImage: `url(${currentConcert.photo})` } : {}}>
      <img className="music-note-pin" src={musicNote} alt="" aria-hidden="true" />
      <span>À l'affiche</span>
      <strong>{currentConcert?.titre || "Concertia"}</strong>
      {concertSlides.length > 1 && <div className="home-photo-dots">{concertSlides.map((concert, index) => <i className={index === currentSlide ? "active" : ""} key={concert.id} />)}</div>}
    </div>
    <img className="ticket-corner-decoration" src={ticket} alt="" aria-hidden="true" />
  </section>;
}
