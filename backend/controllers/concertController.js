const Concert = require("../models/Concert");
const TicketCategory = require("../models/TicketCategory");
const Seat = require("../models/Seat");
const { ensureSeats } = require("./categoryController");

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
    res.json({ concert, categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listConcerts = async (req, res) => {
  try {
    const concerts = await Concert.find().sort({ date: 1, createdAt: -1 });
    res.json(concerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createConcert = async (req, res) => {
  try {
    const { titre, date, lieu } = req.body;
    if (!titre || !date || !lieu)
      return res.status(400).json({ message: "Le titre, la date et le lieu sont obligatoires" });
    res.status(201).json(await Concert.create(req.body));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateConcert = async (req, res) => {
  try {
    const concert = await Concert.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!concert) return res.status(404).json({ message: "Concert introuvable" });
    res.json(concert);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};