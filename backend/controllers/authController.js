const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
};