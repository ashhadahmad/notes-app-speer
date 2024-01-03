const express = require("express");
const router = express.Router();
const {
  getNotes,
  createNote,
  getNoteById,
  updateNoteById,
  deleteNoteById,
  shareNoteById,
} = require("../../controller/api/notes.controller.js");
const passport = require("passport");

router.get("/", passport.authenticate("jwt", { session: false }), getNotes);
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  getNoteById
);
router.post("/", passport.authenticate("jwt", { session: false }), createNote);
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateNoteById
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteNoteById
);
router.post(
  "/:id/share",
  passport.authenticate("jwt", { session: false }),
  shareNoteById
);

module.exports = router;
