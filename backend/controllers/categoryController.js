const TicketCategory = require("../models/TicketCategory");
const Seat = require("../models/Seat");

const seatPrefix = (nom) => {
  if (nom.toLowerCase() === "vip") return "V";
  if (nom.toLowerCase() === "premium") return "P";
  return "S";
};

const createSeats = async (category, start, count) => {
  const prefix = seatPrefix(category.nom);
  const seats = Array.from({ length: count }, (_, offset) => {
    const index = start + offset;
    const rangee = String.fromCharCode(65 + Math.floor(index / 10));
    const numero = (index % 10) + 1;
    return {
      concert: category.concert,
      categorie: category._id,
      code: `${prefix}-${rangee}${numero}`,
      rangee,
      numero,
    };
  });
  if (seats.length) await Seat.insertMany(seats);
};

const ensureSeats = async (category) => {
  const count = await Seat.countDocuments({ categorie: category._id });
  if (count < category.quantiteTotale) await createSeats(category, count, category.quantiteTotale - count);
};

exports.ensureSeats = ensureSeats;

exports.list = async (req, res) => {
  const filter = req.query.concert ? { concert: req.query.concert } : {};
  try {
    const categories = await TicketCategory.find(filter).sort({ prix: 1, nom: 1 });
    const result = await Promise.all(categories.map(async (category) => {
      await ensureSeats(category);
      const availableSeats = await Seat.countDocuments({ categorie: category._id, statut: "disponible" });
      if (availableSeats !== category.quantiteRestante) {
        category.quantiteRestante = availableSeats;
        await category.save();
      }
      return category;
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { concert, nom, prix, quantiteTotale } = req.body;
    const total = Number(quantiteTotale);
    if (!concert || !nom || !Number.isFinite(Number(prix)) || !Number.isInteger(total) || total < 1)
      return res.status(400).json({ message: "Concert, nom, prix et une quantité positive sont obligatoires" });
    const cat = await TicketCategory.create({
      concert, nom, prix: Number(prix), quantiteTotale: total, quantiteRestante: total,
    });
    try {
      await createSeats(cat, 0, total);
    } catch (err) {
      await TicketCategory.findByIdAndDelete(cat._id);
      throw err;
    }
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const cat = await TicketCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: "Catégorie introuvable" });
    const { nom, prix, quantiteTotale } = req.body;
    const total = quantiteTotale === undefined ? undefined : Number(quantiteTotale);
    if (total !== undefined && (!Number.isInteger(total) || total < 1))
      return res.status(400).json({ message: "La quantité totale doit être un entier positif" });
    const currentSeats = quantiteTotale !== undefined
      ? await Seat.find({ categorie: cat._id }).sort({ rangee: -1, numero: -1 })
      : [];
    let removable = [];
    if (nom !== undefined) cat.nom = nom;
    if (prix !== undefined) cat.prix = prix;
    if (quantiteTotale !== undefined) {
      // on garde le nombre de places déjà vendues
      const vendus = cat.quantiteTotale - cat.quantiteRestante;
      if (total < vendus)
        return res.status(400).json({ message: `Impossible : ${vendus} tickets déjà vendus` });
      cat.quantiteTotale = total;

      cat.quantiteRestante = total - vendus;
      if (total < currentSeats.length) {
        removable = currentSeats
          .filter((seat) => seat.statut === "disponible")
          .slice(0, currentSeats.length - total);
        if (removable.length !== currentSeats.length - total)
          return res.status(400).json({ message: "Impossible de supprimer des places occupées" });
      }
    }
    await cat.save();
    if (total !== undefined) {
      if (total > currentSeats.length) {
        await createSeats(cat, currentSeats.length, total - currentSeats.length);
      } else if (total < currentSeats.length) {
        await Seat.deleteMany({ _id: { $in: removable.map((seat) => seat._id) } });
      }
    }
    res.json(cat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  const cat = await TicketCategory.findByIdAndDelete(req.params.id);
  if (!cat) return res.status(404).json({ message: "Catégorie introuvable" });
  await Seat.deleteMany({ categorie: cat._id });
  res.json({ message: "Catégorie supprimée" });
};