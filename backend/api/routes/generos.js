const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

// Ruta para obtener los géneros del usuario
router.get("/generos", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token no válido o expirado" });
    }

    const userId = decoded.userId;

    // Nueva consulta para obtener géneros únicos usados por el usuario
    const query = `
      SELECT DISTINCT g.id, g.nombre, g.coverGenero
      FROM books b
      JOIN genero g ON b.id_genero = g.id
      WHERE b.user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error al obtener los géneros" });
      }
      res.json(results);
    });
  });
});

module.exports = router;
