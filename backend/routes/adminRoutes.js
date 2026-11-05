const router = require("express").Router();
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const c = require("../controllers/adminController");
<<<<<<< HEAD
const adminController = require("../controllers/adminController");
=======

>>>>>>> origin/notification
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
<<<<<<< HEAD
router.put("/users/:id/approve", c.approveUser);
router.get("/notifications", c.getNotifications);

router.put(
  "/notifications/:id/read",
  c.markNotificationRead
);

router.put("/users/:id/refuse", c.refuseUser);
=======

>>>>>>> origin/notification
module.exports = router;