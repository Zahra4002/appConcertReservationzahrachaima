const Concert = require("../models/Concert");
const TicketCategory = require("../models/TicketCategory");
const Seat = require("../models/Seat");
const Reservation = require("../models/Reservation");
const mongoose = require("mongoose");
const { ensureSeats } = require("./categoryController");

const normalizePhotos = (photos, affiche) => {
  const list = Array.isArray(photos) ? photos.filter((photo) => typeof photo === "string" && photo.trim()) : [];
  if (!list.length && typeof affiche === "string" && affiche.trim()) list.push(affiche);
  return [...new Set(list)];
};

const serializeConcert = (concert) => {
  const result = concert.toObject ? concert.toObject() : { ...concert };
  result.photos = normalizePhotos(result.photos, result.affiche);
  if (!result.affiche && result.photos[0]) result.affiche = result.photos[0];
  return result;
};

// Page "À propos" : le concert + ses catégories de tickets
exports.getConcert = async (req, res) => {
  try {
    const concert = await Concert.findOne().sort({ createdAt: -1 });
    if (!concert) return res.status(404).json({ message: "Aucun concert" });
    const categories = await TicketCategory.find({ concert: concert._id });
    await Promise.all(categories.map((category) => ensureSeats(category)));
    await Promise.all(categories.map(async (category) => {
      category.quantiteRestante = await Seat.countDocuments({ categorie: category._id, statut: "disponible" });
      await category.save();
    }));
    res.json({ concert: serializeConcert(concert), categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listConcerts = async (req, res) => {
  try {
    const concerts = await Concert.find().sort({ date: 1, createdAt: -1 });
    res.json(concerts.map(serializeConcert));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.catalog = async (req, res) => {
  try {
    const concerts = await Concert.find().sort({ date: 1, createdAt: -1 });
    const result = await Promise.all(concerts.map(async (concert) => {
      const categories = await TicketCategory.find({ concert: concert._id }).sort({ prix: 1 });
      await Promise.all(categories.map(async (category) => {
        const available = await Seat.countDocuments({ categorie: category._id, statut: "disponible" });
        if (available !== category.quantiteRestante) {
          category.quantiteRestante = available;
          await category.save();
        }
      }));
      return { ...serializeConcert(concert), categories };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    if (!require("mongoose").Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Identifiant de concert invalide" });
    const concert = await Concert.findById(req.params.id);
    if (!concert) return res.status(404).json({ message: "Concert introuvable" });
    const categories = await TicketCategory.find({ concert: concert._id }).sort({ prix: 1 });
    res.json({ concert: serializeConcert(concert), categories });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.createConcert = async (req, res) => {
  try {
    const { titre, date, lieu } = req.body;
    if (!titre || !date || !lieu)
      return res.status(400).json({ message: "Le titre, la date et le lieu sont obligatoires" });
    const photos = normalizePhotos(req.body.photos, req.body.affiche);
    const created = await Concert.create({ ...req.body, photos, affiche: req.body.affiche || photos[0] || "" });
    res.status(201).json(serializeConcert(created));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateConcert = async (req, res) => {
  try {
    const existing = await Concert.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Concert introuvable" });
    const update = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(req.body, "photos") || Object.prototype.hasOwnProperty.call(req.body, "affiche")) {
      update.photos = normalizePhotos(req.body.photos, req.body.affiche);
      update.affiche = req.body.affiche || update.photos[0] || "";
    }
    const concert = await Concert.findByIdAndUpdate(req.params.id, update, {
      new: true, runValidators: true,
    });
    res.json(serializeConcert(concert));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.removeConcert = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Identifiant de concert invalide" });

    const concert = await Concert.findById(req.params.id);
    if (!concert) return res.status(404).json({ message: "Concert introuvable" });

    const categories = await TicketCategory.find({ concert: concert._id }).select("_id");
    const categoryIds = categories.map((category) => category._id);

    await Reservation.deleteMany({ categorie: { $in: categoryIds } });
    await Seat.deleteMany({ concert: concert._id });
    await TicketCategory.deleteMany({ concert: concert._id });
    await Concert.deleteOne({ _id: concert._id });

    res.json({ message: "Concert supprimé" });
  } catch (err) {
    console.error("Erreur suppression concert:", err);
    res.status(500).json({ message: err.message });
  }
};