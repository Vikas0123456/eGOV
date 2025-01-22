const jwt = require("jsonwebtoken");

function generateToken(payload) {
  // Generate JWT
  if (!payload || typeof payload !== "object") {
    return "Invalid payload";
  }
  const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "1d" });
  return token;
}

module.exports = { generateToken };
