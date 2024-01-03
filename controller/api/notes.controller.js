const hello = (req, res) =>
  res.json(200, {
    message: "Hello from controller notes",
  });

module.exports = {
  hello,
};
