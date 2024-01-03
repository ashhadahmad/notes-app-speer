const express = require("express");
const dotenv = require("dotenv");
const db = require("./config/mongoose");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use("/", require("./routes"));

// Start express server
app.listen(port, (error) => {
  if (error) {
    console.log("[error] Error in running the server");
  } else {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  }
});
