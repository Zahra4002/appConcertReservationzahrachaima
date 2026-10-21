require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Concert = require("./models/Concert");
const TicketCategory = require("./models/TicketCategory");
const User = require("./models/User");
const Seat = require("./models/Seat");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await Concert.deleteMany();
  await TicketCategory.deleteMany();
  await Seat.deleteMany();

  const concert = await Concert.create({
    titre: "Mon concert",
    description: "Description du concert",
    date: new Date("2026-12-20"),
    heure: "20:30",
    lieu: "Tunis",
    programme: ["Artiste 1", "Artiste 2"],
  });

  const categories = await TicketCategory.insertMany([
    { concert: concert._id, nom: "Standard", prix: 40, quantiteTotale: 200, quantiteRestante: 200 },
    { concert: concert._id, nom: "Premium", prix: 70, quantiteTotale: 100, quantiteRestante: 100 },
    { concert: concert._id, nom: "VIP", prix: 100, quantiteTotale: 50, quantiteRestante: 50 },
  ]);

  const seats = [];
  for (const category of categories) {
    const prefix = category.nom === "VIP" ? "V" : category.nom === "Premium" ? "P" : "S";
    for (let index = 0; index < category.quantiteTotale; index += 1) {
      const row = String.fromCharCode(65 + Math.floor(index / 10));
      const number = (index % 10) + 1;
      seats.push({
        concert: concert._id,
        categorie: category._id,
        code: `${prefix}-${row}${number}`,
        rangee: row,
        numero: number,
      });
    }
  }
  await Seat.insertMany(seats);

  // Compte admin (change le mot de passe après le premier test)
  const email = "admin@concert.com";
  if (!(await User.findOne({ email }))) {
    await User.create({
      nom: "Admin", prenom: "Admin", email,

      motDePasse: await bcrypt.hash("Admin123!", 10),
      role: "admin",
    });
  }

  console.log("Seed terminé. Admin : admin@concert.com / Admin123!");
  process.exit();
})();