<<<<<<< HEAD

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Récupérer le token envoyé par le frontend
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.substring(7)
    : null;

  // Vérifier si le token existe
  if (!token) {
    return res.status(401).json({
      message: "Non connecté. Token manquant."
    });
  }

  try {
    // Vérifier la validité du token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer les informations de l'utilisateur
    req.user = {
      id: payload.id,
      role: payload.role
    };

    // Passer au middleware ou contrôleur suivant
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Token invalide ou expiré."
    });
  }
};
=======
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Non connecté" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
};
>>>>>>> origin/notification
