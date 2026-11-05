const mongoose = require("mongoose");

const concertSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
    description: String,
    date: { type: Date, required: true },
    heure: String,
    lieu: { type: String, required: true },
    artiste: String,
    affiche: String,
    photos: { type: [String], default: [] },
    dateLimiteAnnulation: { type: Date, default: null },
    programme: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Concert", concertSchema);