const mongoose = require("mongoose");

function connect(dbURI) {
  return mongoose
    .connect(dbURI)
    .then(() => {
      console.log("[db] Successfully connected to DB");
    })
    .catch((error) => console.log("[db] Error connecting to the db", error));
}

module.exports = connect;
