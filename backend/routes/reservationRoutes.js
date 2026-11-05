const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/reservationController");

router.post("/", auth, c.create);
router.get("/plan/:concertId", c.seatPlan);
router.get("/mine", auth, c.mine);
router.put("/:id/cancel", auth, c.cancel);

module.exports = router;