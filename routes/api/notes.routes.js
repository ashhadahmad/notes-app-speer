const express = require("express");
const router = express.Router();
const { hello } = require("../../controller/api/notes.controller.js");

router.get("/", hello);

module.exports = router;
