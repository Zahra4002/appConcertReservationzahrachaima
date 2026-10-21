const mongoose = require("mongoose");
const crypto = require("crypto");

const reservationSchema = new mongoose.Schema(
  {
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: "TicketCategory", required: true },
    quantite: { type: Number, required: true, min: 1, max: 6 },
    places: [{ type: mongoose.Schema.Types.ObjectId, ref: "Seat" }],
    codeTicket: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(5).toString("hex").toUpperCase(),
    },
    statut: { type: String, enum: ["confirmee", "annulee"], default: "confirmee" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);