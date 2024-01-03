const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.json(200, { message: "hello from api" }));
router.use("/auth", require("./auth.routes"));
router.use("/notes", require("./notes.routes"));

module.exports = router;
