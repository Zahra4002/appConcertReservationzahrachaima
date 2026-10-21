const router = require("express").Router();
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const c = require("../controllers/concertController");

router.get("/", c.getConcert);                       // public (page À propos)
router.get("/all", auth, isAdmin, c.listConcerts);
router.post("/", auth, isAdmin, c.createConcert);
router.put("/:id", auth, isAdmin, c.updateConcert);

module.exports = router;