const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ error: "Token no válido o ausente" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Clave debe coincidir con auth.js
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Token no válido" });
  }
};

module.exports = verifyToken;
