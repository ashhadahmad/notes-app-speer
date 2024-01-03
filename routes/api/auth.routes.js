const express = require("express");
const router = express.Router();
const { signUp, signIn } = require("../../controller/api/auth.controller.js");

router.post("/signup", signUp);
router.post("/login", signIn);

module.exports = router;
