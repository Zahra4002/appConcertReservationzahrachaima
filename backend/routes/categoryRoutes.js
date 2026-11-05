const router = require("express").Router();
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const c = require("../controllers/categoryController");

router.get("/", c.list);                             // public
router.post("/", auth, isAdmin, c.create);
router.put("/:id", auth, isAdmin, c.update);
router.delete("/:id", auth, isAdmin, c.remove);

module.exports = router;