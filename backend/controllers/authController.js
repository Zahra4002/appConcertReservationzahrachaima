const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
<<<<<<< HEAD
const Notification = require("../models/Notification");

// Générer le token
const makeToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// Informations publiques de l'utilisateur
const publicUser = (u) => ({
  id: u._id,
  nom: u.nom,
  prenom: u.prenom,
  email: u.email,
  telephone: u.telephone,
  role: u.role,
  statutCompte: u.statutCompte
});

// Envoyer une notification à tous les administrateurs
const notifyAdmins = async (type, message, lien) => {
  const admins = await User.find({ role: "admin" });

  if (admins.length === 0) {
    console.log("Aucun administrateur trouvé pour recevoir la notification");
    return;
  }

  await Notification.insertMany(
    admins.map((admin) => ({
      destinataire: admin._id,
      type: type,
      message: message,
      lien: lien,
      lu: false
    }))
  );
};

// INSCRIPTION
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, motDePasse } = req.body;

    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({
        message: "Champs obligatoires manquants"
      });
    }

    if (motDePasse.length < 6) {
      return res.status(400).json({
        message: "Mot de passe trop court (6 caractères minimum)"
      });
    }

    const emailNormalise = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: emailNormalise
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Cet e-mail est déjà utilisé"
      });
    }

    const hash = await bcrypt.hash(motDePasse, 10);

    // Création du compte en attente
    const user = await User.create({
      nom,
      prenom,
      email: emailNormalise,
      telephone,
      motDePasse: hash,
      role: "user",
      statutCompte: "en_attente"
    });

    // Notification aux administrateurs
    try {
      await notifyAdmins(
        "inscription",
        `Nouvelle demande de compte : ${user.prenom} ${user.nom}`,
        "/admin/users"
      );
    } catch (notificationError) {
      console.error(
        "Erreur notification inscription :",
        notificationError
      );
    }

    return res.status(201).json({
      message: "Votre demande a été envoyée. En attente de validation par l'administrateur."
    });

  } catch (err) {
    console.error("Erreur register :", err);

    return res.status(500).json({
      message: err.message
    });
  }
};

// CONNEXION
exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({
      email: (email || "").toLowerCase().trim()
    });

    if (!user || !(await bcrypt.compare(motDePasse || "", user.motDePasse))) {
      return res.status(401).json({
        message: "E-mail ou mot de passe incorrect"
      });
    }

    // Vérifier le statut AVANT de générer le token
    if (user.statutCompte === "en_attente") {
      return res.status(403).json({
        message: "Votre compte est en attente de validation par l'administrateur."
      });
    }

    if (user.statutCompte === "refuse") {
      return res.status(403).json({
        message: "Votre demande de compte a été refusée."
      });
    }

    return res.json({
      token: makeToken(user),
      user: publicUser(user)
    });

  } catch (err) {
    console.error("Erreur login :", err);

    return res.status(500).json({
      message: err.message
    });
  }
};

// RÉCUPÉRER L'UTILISATEUR CONNECTÉ
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable"
      });
    }

    res.json(publicUser(user));

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
=======

const makeToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (u) => ({
  id: u._id, nom: u.nom, prenom: u.prenom, email: u.email, telephone: u.telephone, role: u.role,
});

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, motDePasse } = req.body;
    if (!nom || !prenom || !email || !motDePasse)
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    if (motDePasse.length < 6)
      return res.status(400).json({ message: "Mot de passe trop court (6 caractères minimum)" });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ message: "Cet e-mail est déjà utilisé" });

    const hash = await bcrypt.hash(motDePasse, 10);
    // le rôle est toujours "user" à l'inscription
    const user = await User.create({ nom, prenom, email, telephone, motDePasse: hash });
    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await bcrypt.compare(motDePasse || "", user.motDePasse)))
      return res.status(401).json({ message: "E-mail ou mot de passe incorrect" });
    res.json({ token: makeToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
  res.json(publicUser(user));
>>>>>>> origin/notification
};