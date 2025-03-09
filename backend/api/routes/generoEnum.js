const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db"); // Tu configuración de base de datos
const router = express.Router();

// Ruta para obtener los valores del ENUM "genero"
router.get("/generoEnum", (req, res) => { 
  // Obtener el token de autorización desde los encabezados
  const token = req.headers.authorization?.split(" ")[1]; // 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Verificar el token JWT
  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) {
      return res.status(403).json({ error: "Token no válido o expirado" });
    }

    // Consulta para obtener los valores del ENUM
    db.query("SHOW COLUMNS FROM books LIKE 'genero'", (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error al obtener los géneros" });
      }

      // Extraer los valores del ENUM
      const enumValues = results[0].Type.match(/enum\((.+)\)/)[1]
        .split(",")
        .map(value => value.replace(/'/g, "")); // Eliminar comillas

      res.json(enumValues); // Enviar los valores del ENUM
    });
  });
});

module.exports = router;
