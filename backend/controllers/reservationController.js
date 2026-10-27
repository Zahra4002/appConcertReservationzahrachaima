const Reservation = require("../models/Reservation");
const TicketCategory = require("../models/TicketCategory");
const Seat = require("../models/Seat");

exports.seatPlan = async (req, res) => {
  try {
    const seats = await Seat.find({ concert: req.params.concertId })
      .populate("categorie", "nom prix")
      .sort({ categorie: 1, rangee: 1, numero: 1 });
    res.json({
      scene: "Scène",
      places: seats.map((seat) => ({
        id: seat._id,
        code: seat.code,
        rangee: seat.rangee,
        numero: seat.numero,
        statut: seat.statut,
        categorie: seat.categorie,
      })),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Réserver : le stock est décrémenté de façon atomique (pas de sur-réservation)
exports.create = async (req, res) => {
  const { categorie, quantite, places } = req.body;
  const selectedSeats = Array.isArray(places) ? [...new Set(places)] : [];
  const qte = Number(quantite || selectedSeats.length);
  if (!categorie || !Number.isInteger(qte) || qte < 1 || qte > 6)
    return res.status(400).json({ message: "Quantité invalide (entre 1 et 6)" });
  if (selectedSeats.length !== qte)
    return res.status(400).json({ message: "Sélectionnez exactement les places réservées" });

  try {
    const seats = await Seat.find({ _id: { $in: selectedSeats }, categorie });
    if (seats.length !== qte)
      return res.status(400).json({ message: "Une ou plusieurs places ne correspondent pas à cette catégorie" });

    const claimed = await Seat.updateMany(
      { _id: { $in: selectedSeats }, categorie, statut: "disponible" },
      { $set: { statut: "occupee" } }
    );
    if (claimed.modifiedCount !== qte)
      return res.status(409).json({ message: "Une ou plusieurs places viennent d'être réservées" });

    const cat = await TicketCategory.findOneAndUpdate(
      { _id: categorie, quantiteRestante: { $gte: qte } },
      { $inc: { quantiteRestante: -qte } },
      { new: true }
    );
    if (!cat) {
      await Seat.updateMany({ _id: { $in: selectedSeats } }, { $set: { statut: "disponible" } });
      return res.status(400).json({ message: "Plus assez de places disponibles" });
    }

    try {
      const reservation = await Reservation.create({
        utilisateur: req.user.id,
        categorie,
        quantite: qte,
        places: selectedSeats,
        statut: "confirmee",
      });
      res.status(201).json(await reservation.populate("places", "code rangee numero"));
    } catch (err) {
      // la réservation a échoué : on remet les places
      await TicketCategory.findByIdAndUpdate(categorie, { $inc: { quantiteRestante: qte } });
      await Seat.updateMany({ _id: { $in: selectedSeats } }, { $set: { statut: "disponible" } });
      throw err;
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.mine = async (req, res) => {
  const list = await Reservation.find({ utilisateur: req.user.id })
    .populate({ path: "categorie", select: "nom prix concert", populate: { path: "concert", select: "titre date lieu affiche dateLimiteAnnulation" } })
    .sort({ createdAt: -1 });
  res.json(list);
};

exports.cancel = async (req, res) => {
  try {
    const existing = await Reservation.findOne({ _id: req.params.id, utilisateur: req.user.id, statut: "confirmee" })
      .populate({ path: "categorie", select: "concert", populate: { path: "concert", select: "dateLimiteAnnulation" } });
    if (!existing) return res.status(404).json({ message: "Réservation introuvable ou déjà annulée" });
    const deadline = existing.categorie?.concert?.dateLimiteAnnulation;
    if (deadline && new Date() > new Date(deadline))
      return res.status(403).json({ message: "La date limite d'annulation est dépassée" });
    const r = await Reservation.findOneAndUpdate(
      { _id: req.params.id, utilisateur: req.user.id, statut: "confirmee" },
      { statut: "annulee" },
      { new: true }
    );
    if (!r) return res.status(404).json({ message: "Réservation introuvable ou déjà annulée" });
    await TicketCategory.findByIdAndUpdate(r.categorie, { $inc: { quantiteRestante: r.quantite } });
    if ((r.places || []).length) {
      await Seat.updateMany({ _id: { $in: r.places } }, { $set: { statut: "disponible" } });
    }
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};