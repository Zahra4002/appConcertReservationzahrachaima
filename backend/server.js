require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const openapi = require("./openapi");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.redirect("/api-docs"));
app.get("/health", (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;
  res.status(mongoConnected ? 200 : 503).json({
    status: mongoConnected ? "ok" : "degraded",
    mongodb: mongoConnected ? "connected" : "disconnected",
  });
});
app.get("/openapi.json", (req, res) => res.json(openapi));
app.get("/api-docs", (req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>Concert Ticket API - Swagger</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>window.ui = SwaggerUIBundle({ url: "/openapi.json", dom_id: "#swagger-ui" });</script>
  </body>
</html>`);
});
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/concert", require("./routes/concertRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/reservations", require("./routes/reservationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Erreur serveur" });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log("Serveur sur le port " + PORT)));