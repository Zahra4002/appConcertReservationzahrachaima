const router = require("express").Router();
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const c = require("../controllers/concertController");

router.get("/", c.getConcert);                       // public (page À propos)
router.get("/catalog", c.catalog);
router.get("/all", auth, isAdmin, c.listConcerts);
// Keep this parameterized route after all named routes.
router.post("/", auth, isAdmin, c.createConcert);
router.delete("/:id", auth, isAdmin, c.removeConcert);
router.put("/:id", auth, isAdmin, c.updateConcert);
router.get("/:id", c.getById);

module.exports = router;