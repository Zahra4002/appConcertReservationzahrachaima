const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    concert: { type: mongoose.Schema.Types.ObjectId, ref: "Concert", required: true },
    nom: { type: String, required: true, trim: true },
    prix: { type: Number, required: true, min: 0 },
    quantiteTotale: { type: Number, required: true, min: 0 },
    quantiteRestante: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TicketCategory", categorySchema);