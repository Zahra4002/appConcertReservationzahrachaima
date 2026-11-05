const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  destinataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: String,
    enum: ["reservation", "annulation", "inscription"],
    required: true
  },

  message: {
    type: String,
    required: true
  },

  lien: {
    type: String,
    default: "/admin"
  },

  lu: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);