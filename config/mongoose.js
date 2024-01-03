const mongoose = require("mongoose");

mongoose
  .connect(`mongodb://127.0.0.1:27017/notes_app_speer`)
  .then(() => {
    console.log("[server] Successfully connected to DB");
  })
  .catch((error) => console.log("[server] Error connecting to the db", error));

module.exports = mongoose.connection;
