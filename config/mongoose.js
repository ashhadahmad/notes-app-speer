const mongoose = require("mongoose");

mongoose
  .connect(`mongodb://127.0.0.1:27017/notes_app_speer`)
  .then(() => {
    console.log("[db] Successfully connected to DB");
  })
  .catch((error) => console.log("[db] Error connecting to the db", error));

module.exports = mongoose.connection;
