const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    telephone: { type: String, trim: true },
    motDePasse: { type: String, required: true },
    statutCompte: {
  type: String,
  enum: ["en_attente", "accepte", "refuse"],
  default: "en_attente"
},
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);