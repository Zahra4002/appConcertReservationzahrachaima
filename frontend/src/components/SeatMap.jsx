export default function SeatMap({ seats, selected, onToggle }) {
  const rows = {};
  seats.forEach((seat) => { (rows[seat.rangee] ||= []).push(seat); });
  return <section className="seat-map"><div className="stage">SCÈNE</div>
    <div className="seat-legend"><span><i className="available" /> Disponible</span><span><i className="chosen" /> Sélectionnée</span><span><i className="occupied" /> Occupée</span></div>
    {Object.entries(rows).sort().map(([row, rowSeats]) => <div className="seat-row" key={row}><b>{row}</b>{rowSeats.sort((a, b) => a.numero - b.numero).map((seat) => <button key={seat.id} disabled={seat.statut !== "disponible"} className={`seat ${selected.includes(seat.id) ? "chosen" : seat.statut === "occupee" ? "occupied" : "available"}`} onClick={() => onToggle(seat)}>{seat.numero}</button>)}</div>)}
  </section>;
}
