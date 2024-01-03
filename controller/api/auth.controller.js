const bcrypt = require("bcrypt");
const User = require("../../models/user");
const jwt = require("jsonwebtoken");

const hello = (req, res) =>
  res.json(200, {
    message: "Hello from controller auth",
  });

// Create a new user
const signUp = async function (req, res) {
  // Check if user already exists
  try {
    const user = await User.findOne({ email: req.body.email }).exec();
    if (user)
      return res.status(409).json({
        message: "User already exists.",
      });
    // User does not exist, create it
    else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        // Hash the password using bcrypt
        password: bcrypt.hashSync(req.body.password, 8),
      });
      await newUser.save();
      return res.status(200).json({
        message: "User created successfully",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// Authenticate an existing user and create a session
// Sign in and get the session
const signIn = async function (req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    // User does not exist
    if (!user) {
      return res.status(422).json({
        message: "User not found",
      });
    }

    // User exists, compare passwords
    if (bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(200).json({
        message: "Success, here is your token",
        data: {
          token: jwt.sign(
            {
              id: user.id,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: 86400,
            }
          ),
        },
      });
    }
    // Password Mismatch
    else {
      return res.status(401).json({
        message: "Invalid password",
      });
    }
  } catch (err) {
    console.log(err);
    return res.json(500, {
      message: "Server error",
    });
  }
};

module.exports = {
  hello,
  signUp,
  signIn,
};
