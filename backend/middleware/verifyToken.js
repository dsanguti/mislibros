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
    console.log("🔹 Token verificado. Decodificado:", decoded);
    console.log("🌐 Protocolo de la solicitud:", req.protocol); // Verifica el protocolo (http o https)
    console.log("🛠️ Host de la solicitud:", req.headers.host); // Verifica el host

    next();
  } catch (error) {
    console.error("Error al verificar el token:", error); // Log del error para depuración
    res.status(403).json({ error: "Token no válido" });
  }
};

module.exports = verifyToken;
