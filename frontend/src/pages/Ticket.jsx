import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import api from "../api/axios";
export default function Ticket() {
  const { id } = useParams(); const [item, setItem] = useState(null);
  useEffect(() => { api.get("/reservations/mine").then(({ data }) => setItem(data.find((entry) => entry._id === id))); }, [id]);
  if (!item) return <div className="page-state">Chargement du ticket...</div>;
  return <div className="ticket-page"><div className="ticket-card"><p className="eyebrow">VOTRE E-TICKET</p><h2>{item.categorie?.concert?.titre || "Concertia"}</h2><div className="ticket-code">{item.codeTicket}</div><QRCodeCanvas value={`concertia:${item.codeTicket}`} size={180} includeMargin /><div className="ticket-details"><span>{item.quantite} place(s)</span><span>{item.categorie?.nom}</span></div><button className="outline-button" onClick={() => window.print()}>Imprimer / PDF</button></div></div>;
}
