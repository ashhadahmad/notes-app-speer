const express = require("express");
const dotenv = require("dotenv");
const db = require("./config/mongoose");
const passport = require("passport");

// Load environment variables
dotenv.config();

const passportJWT = require("./config/jwt-passport.config");

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use(passport.initialize());
app.use("/", require("./routes"));

// Start express server
app.listen(port, (error) => {
  if (error) {
    console.log("[error] Error in running the server");
  } else {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  }
});
