const express = require("express");
const router = express.Router();

const passport = require("passport");
const { searchNotes } = require("../../controller/api/notes.controller");

router.use("/auth", require("./auth.routes"));
router.use("/notes", require("./notes.routes"));
router.get(
  "/search",
  passport.authenticate("jwt", { session: false }),
  searchNotes
);

module.exports = router;
