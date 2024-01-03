const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Missing: email"],
      unique: [true, "Duplicate: Email already exists"],
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Missing: name"],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
