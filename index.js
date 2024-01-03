const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");
const apiLimiter = require("./config/rateLimiter");

// Load environment variables
dotenv.config();
const passportJWT = require("./config/jwtPassport");
const app = express();

// Use a different database URI for testing if the NODE_ENV is set to 'test'
const dbUri =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DB_URI
    : process.env.DB_URI;

// Connect to the MongoDB database
const db = require("./config/mongoose")(dbUri);

app.use(express.json());
app.use(passport.initialize());
app.use("/", apiLimiter, require("./routes"));

module.exports = app;

// Start express server if the environment variable is not set to test
if (process.env.NODE_ENV !== "test") {
  const db = require("./config/mongoose");
  app.listen(process.env.PORT, (error) => {
    if (error) {
      console.log("[error] Error in running the server");
    } else {
      console.log(
        `[server]: Server is running at http://localhost:${process.env.PORT}`
      );
    }
  });
}
