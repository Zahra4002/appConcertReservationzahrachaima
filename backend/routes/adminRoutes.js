const router = require("express").Router();
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const c = require("../controllers/adminController");

router.use(auth, isAdmin); // toutes les routes admin sont protégées

router.get("/stats", c.stats);
router.get("/users", c.listUsers);
router.post("/users", c.createUser);
router.put("/users/:id", c.updateUser);
router.delete("/users/:id", c.deleteUser);
router.get("/reservations", c.listReservations);
router.get("/reservations/:id", c.getReservation);
router.put("/reservations/:id", c.updateReservation);
router.delete("/reservations/:id", c.deleteReservation);

module.exports = router;