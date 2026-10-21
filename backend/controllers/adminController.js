const Reservation = require("../models/Reservation");
const TicketCategory = require("../models/TicketCategory");
const User = require("../models/User");
const Seat = require("../models/Seat");
const { ensureSeats } = require("./categoryController");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Liste des réservations (filtres : statut, categorie, q = nom/email/code)
exports.listReservations = async (req, res) => {
  try {
    const { statut, categorie, q } = req.query;
    const filter = {};
    if (statut) filter.statut = statut;
    if (categorie) filter.categorie = categorie;
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      const users = await User.find({ $or: [{ nom: rx }, { prenom: rx }, { email: rx }] }).select("_id");
      filter.$or = [{ utilisateur: { $in: users.map((u) => u._id) } }, { codeTicket: rx }];
    }
    const list = await Reservation.find(filter)
      .populate("utilisateur", "nom prenom email telephone")
      .populate("categorie", "nom prix")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReservation = async (req, res) => {
  const r = await Reservation.findById(req.params.id)
    .populate("utilisateur", "nom prenom email telephone")
    .populate("categorie", "nom prix");

  if (!r) return res.status(404).json({ message: "Réservation introuvable" });
  res.json(r);
};

// Modifier quantité et/ou statut, en gardant le stock cohérent
exports.updateReservation = async (req, res) => {
  try {
    const r = await Reservation.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Réservation introuvable" });

    const newStatut = req.body.statut ?? r.statut;
    const newQte = req.body.quantite !== undefined ? Number(req.body.quantite) : r.quantite;
    if (!["confirmee", "annulee"].includes(newStatut))
      return res.status(400).json({ message: "Statut invalide" });
    if (!Number.isInteger(newQte) || newQte < 1 || newQte > 6)
      return res.status(400).json({ message: "Quantité invalide (entre 1 et 6)" });

    const avant = r.statut === "confirmee" ? r.quantite : 0;
    const apres = newStatut === "confirmee" ? newQte : 0;
    const delta = apres - avant; // places supplémentaires à prendre (ou à rendre si négatif)

    if (delta !== 0) {
      const cat = await TicketCategory.findOneAndUpdate(
        { _id: r.categorie, quantiteRestante: { $gte: delta } },
        { $inc: { quantiteRestante: -delta } }
      );
      if (!cat) return res.status(400).json({ message: "Plus assez de places disponibles" });
    }
    r.statut = newStatut;
    r.quantite = newQte;
    await r.save();
    res.json(r);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const r = await Reservation.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ message: "Réservation introuvable" });
    if (r.statut === "confirmee")
      await TicketCategory.findByIdAndUpdate(r.categorie, { $inc: { quantiteRestante: r.quantite } });
    if (r.statut === "confirmee" && (r.places || []).length)
      await Seat.updateMany({ _id: { $in: r.places } }, { $set: { statut: "disponible" } });
    res.json({ message: "Réservation supprimée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listUsers = async (req, res) => {
  res.json(await User.find().select("-motDePasse").sort({ createdAt: -1 }));
};

// Chiffres pour le tableau de bord
exports.stats = async (req, res) => {
  const categories = await TicketCategory.find();
  await Promise.all(categories.map(async (category) => {
    await ensureSeats(category);
    category.quantiteRestante = await Seat.countDocuments({ categorie: category._id, statut: "disponible" });
    await category.save();
  }));
  const reservations = await Reservation.find({ statut: "confirmee" });
  const ticketsVendus = reservations.reduce((s, r) => s + r.quantite, 0);
  const placesRestantes = categories.reduce((s, c) => s + c.quantiteRestante, 0);
  res.json({
    reservationsConfirmees: reservations.length,
    ticketsVendus,
    placesRestantes,
    utilisateurs: await User.countDocuments(),

    parCategorie: categories.map((c) => ({
      nom: c.nom, vendus: c.quantiteTotale - c.quantiteRestante, restantes: c.quantiteRestante,
    })),
  });
};