const Reservation = require("../models/Reservation");
const TicketCategory = require("../models/TicketCategory");
const User = require("../models/User");
const Seat = require("../models/Seat");
const { ensureSeats } = require("./categoryController");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

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
      .populate({ path: "categorie", select: "nom prix concert", populate: { path: "concert", select: "titre" } })
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReservation = async (req, res) => {
  const r = await Reservation.findById(req.params.id)
    .populate("utilisateur", "nom prenom email telephone")
    .populate({ path: "categorie", select: "nom prix concert", populate: { path: "concert", select: "titre" } });

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

exports.createUser = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, motDePasse, role = "user" } = req.body;
    if (!nom || !prenom || !email || !motDePasse)
      return res.status(400).json({ message: "Nom, prénom, e-mail et mot de passe sont obligatoires" });
    if (motDePasse.length < 6)
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    if (!["user", "admin"].includes(role))
      return res.status(400).json({ message: "Rôle invalide" });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ message: "Cet e-mail est déjà utilisé" });
    const user = await User.create({ nom, prenom, email, telephone, role, motDePasse: await bcrypt.hash(motDePasse, 10) });
    res.status(201).json(await User.findById(user._id).select("-motDePasse"));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Identifiant utilisateur invalide" });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    const { nom, prenom, email, telephone, motDePasse, role } = req.body;
    if (!nom || !prenom || !email || !["user", "admin"].includes(role))
      return res.status(400).json({ message: "Nom, prénom, e-mail et rôle sont obligatoires" });
    const duplicate = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
    if (duplicate) return res.status(400).json({ message: "Cet e-mail est déjà utilisé" });
    user.nom = nom; user.prenom = prenom; user.email = email.toLowerCase();
    user.telephone = telephone; user.role = role;
    if (motDePasse) {
      if (motDePasse.length < 6) return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
      user.motDePasse = await bcrypt.hash(motDePasse, 10);
    }
    await user.save();
    res.json(await User.findById(user._id).select("-motDePasse"));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === String(req.user.id))
      return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1)
        return res.status(400).json({ message: "Impossible de supprimer le dernier administrateur" });
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
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
  const utilisateurs = await User.countDocuments();
  const administrateurs = await User.countDocuments({ role: "admin" });
  const confirmedReservations = await Reservation.find({ statut: "confirmee" }).select("categorie quantite");
  const allCategories = await TicketCategory.find()
    .select("_id concert prix")
    .populate("concert", "titre");
  const categoryDetails = new Map(allCategories.map((item) => [
    String(item._id),
    { concert: item.concert?._id ? String(item.concert._id) : null, titre: item.concert?.titre || "Concert sans titre", prix: item.prix },
  ]));
  const popularity = new Map();
  confirmedReservations.forEach((reservation) => {
    const category = categoryDetails.get(String(reservation.categorie));
    if (!category?.concert) return;
    const current = popularity.get(category.concert) || { titre: category.titre, reservations: 0, tickets: 0, revenus: 0 };
    current.reservations += 1;
    current.tickets += reservation.quantite;
    current.revenus += reservation.quantite * category.prix;
    popularity.set(category.concert, current);
  });
  const concertsMap = new Map();
  allCategories.forEach((category) => {
    if (category.concert?._id) {
      const id = String(category.concert._id);
      if (!concertsMap.has(id)) concertsMap.set(id, { _id: category.concert._id, titre: category.concert.titre });
    }
  });
  popularity.forEach((item, id) => {
    if (!concertsMap.has(id)) concertsMap.set(id, { _id: id, titre: item.titre });
  });
  const concertsWithStats = [...concertsMap.values()].map((concert) => {
    const item = popularity.get(String(concert._id));
    return {
      _id: concert._id,
      titre: concert.titre,
      reservations: item?.reservations || 0,
      tickets: item?.tickets || 0,
      revenus: item?.revenus || 0,
    };
  });
  const concertsPopulaires = [...concertsWithStats]
    .sort((a, b) => b.reservations - a.reservations || b.tickets - a.tickets)
    .slice(0, 6);
  const concertsRentables = [...concertsWithStats]
    .sort((a, b) => b.revenus - a.revenus || b.tickets - a.tickets)
    .slice(0, 6);
  res.json({
    reservationsConfirmees: reservations.length,
    ticketsVendus,
    placesRestantes,
    utilisateurs,
    utilisateursParRole: {
      utilisateurs: utilisateurs - administrateurs,
      administrateurs,
    },
    concertsPopulaires,
    concertsRentables,

    parCategorie: categories.map((c) => ({
      nom: c.nom, vendus: c.quantiteTotale - c.quantiteRestante, restantes: c.quantiteRestante,
    })),
  });
};