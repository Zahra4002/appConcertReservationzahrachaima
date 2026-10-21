const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    concert: { type: mongoose.Schema.Types.ObjectId, ref: "Concert", required: true, index: true },
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: "TicketCategory", required: true, index: true },
    code: { type: String, required: true },
    rangee: { type: String, required: true },
    numero: { type: Number, required: true },
    statut: { type: String, enum: ["disponible", "occupee"], default: "disponible", index: true },
  },
  { timestamps: true }
);

seatSchema.index({ concert: 1, code: 1 }, { unique: true });

module.exports = mongoose.model("Seat", seatSchema);
