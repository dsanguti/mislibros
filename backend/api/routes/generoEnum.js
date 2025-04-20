const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

// Ruta para obtener todos los géneros desde la tabla `genero`
router.get("/generoEnum", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) {
      return res.status(403).json({ error: "Token no válido o expirado" });
    }

    // Consultar la tabla genero
    db.query("SELECT id, nombre, coverGenero FROM genero", (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error al obtener los géneros" });
      }

      res.json(results); // Devuelve un array de objetos con id, nombre, coverGenero
    });
  });
});

module.exports = router;

