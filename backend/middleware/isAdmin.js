module.exports = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  res.status(403).json({ message: "Accès réservé à l'administrateur" });
};