<<<<<<< HEAD

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

=======
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
>>>>>>> origin/notification
const Concert = require("./models/Concert");
const TicketCategory = require("./models/TicketCategory");
const User = require("./models/User");
const Seat = require("./models/Seat");
<<<<<<< HEAD
const Reservation = require("./models/Reservation");

async function creerExemples() {
  try {
    // 1. Connexion à MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI est absent du fichier .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connecté");

    // 2. Supprimer les anciennes données de test
    // Attention : cette opération efface ces collections !
    await Reservation.deleteMany({});
    await Seat.deleteMany({});
    await TicketCategory.deleteMany({});
    await Concert.deleteMany({});
    await User.deleteMany({
      email: {
        $in: [
          "sarra@example.com",
          "admin@example.com",
        ],
      },
    });

    console.log("Anciennes données de test supprimées");

    // 3. Créer un concert
    const concert = await Concert.create({
      titre: "Festival de Musique Tunis",
      description: "Une soirée musicale exceptionnelle",
      date: new Date("2026-12-20"),
      heure: "20:30",
      lieu: "Tunis",
      artiste: "Artiste Exemple",
      affiche: "",
      programme: [
        "Pop",
        "Rock",
        "Musique tunisienne",
      ],
    });

    console.log("Concert créé");

    // 4. Créer les catégories de tickets
    const categories = await TicketCategory.insertMany([
      {
        concert: concert._id,
        nom: "Standard",
        prix: 40,
        quantiteTotale: 10,
        quantiteRestante: 10,
      },
      {
        concert: concert._id,
        nom: "Premium",
        prix: 70,
        quantiteTotale: 5,
        quantiteRestante: 5,
      },
      {
        concert: concert._id,
        nom: "VIP",
        prix: 100,
        quantiteTotale: 3,
        quantiteRestante: 3,
      },
    ]);

    console.log("Catégories créées");

    // 5. Créer les places
    const places = [];

    for (const categorie of categories) {
      const prefixe =
        categorie.nom === "VIP"
          ? "V"
          : categorie.nom === "Premium"
            ? "P"
            : "S";

      for (let i = 0; i < categorie.quantiteTotale; i++) {
        const rangee = String.fromCharCode(
          65 + Math.floor(i / 10)
        );
        const numero = (i % 10) + 1;

        places.push({
          concert: concert._id,
          categorie: categorie._id,
          code: `${prefixe}-${rangee}${numero}`,
          rangee,
          numero,
          statut: "disponible",
        });
      }
    }

    const placesCreees = await Seat.insertMany(places);

    console.log(`${placesCreees.length} places créées`);

    // 6. Créer un utilisateur et un administrateur
    const motDePasseHash = await bcrypt.hash(
      "Test123!",
      10
    );

    const utilisateur = await User.create({
      nom: "Ben Ali",
      prenom: "Sarra",
      email: "sarra@example.com",
      telephone: "20123456",
      motDePasse: motDePasseHash,
      role: "user",
    });

    await User.create({
      nom: "Admin",
      prenom: "Test",
      email: "admin@example.com",
      telephone: "22123456",
      motDePasse: motDePasseHash,
      role: "admin",
      statutCompte:"accepte"
    });

    console.log("Utilisateur et administrateur créés");

    // 7. Créer une réservation de deux places Standard
    const categorieStandard = categories.find(
      (categorie) => categorie.nom === "Standard"
    );

    const placesReservees = placesCreees
      .filter((place) =>
        place.categorie.equals(categorieStandard._id)
      )
      .slice(0, 2);

    if (placesReservees.length !== 2) {
      throw new Error("Impossible de trouver deux places Standard");
    }

    // Marquer les places comme occupées
    await Seat.updateMany(
      {
        _id: {
          $in: placesReservees.map((place) => place._id),
        },
      },
      {
        $set: { statut: "occupee" },
      }
    );

    // Diminuer la quantité restante
    await TicketCategory.findByIdAndUpdate(
      categorieStandard._id,
      {
        $inc: { quantiteRestante: -2 },
      }
    );

    // Enregistrer la réservation
    await Reservation.create({
  utilisateur: utilisateur._id,
  categorie: categorieStandard._id,
  quantite: 2,
  places: placesReservees.map((place) => place._id),
  statut: "confirmee",
});

    console.log("Réservation créée");

    console.log("\nToutes les données de test ont été créées !");
    console.log("Utilisateur : sarra@example.com");
    console.log("Administrateur : admin@example.com");
    console.log("Mot de passe de test : Test123!");
  } catch (erreur) {
    console.error("Erreur :", erreur.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

creerExemples();
=======

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
>>>>>>> origin/notification
