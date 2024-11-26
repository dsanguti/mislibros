const jwt = require("jsonwebtoken");
require("dotenv").config(); // Cargar las variables de entorno

// Middleware para proteger las rutas
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]; // El token debe ir en el encabezado Authorization

  if (!token) {
    return res.status(403).json({ error: "No se proporcionó el token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token no válido" });
    }
    req.user = decoded; // Guardamos la información decodificada en la solicitud
    next(); // Continuamos con la siguiente función de la cadena
  });
};

module.exports = { verifyToken };
