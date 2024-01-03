const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // Per minute
  max: 100, // 100 requests
  message: "Too many requests from this IP, please try again later.",
});

module.exports = apiLimiter;
