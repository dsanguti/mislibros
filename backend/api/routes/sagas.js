const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

// Ruta para obtener las sagas asociadas a libros del usuario
router.get("/sagas", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token no válido o expirado" });
    }

    const userId = decoded.userId;

    // Obtener todas las sagas del usuario, independientemente de si tienen libros asociados
    const query = `
      SELECT s.id, s.nombre, s.coverSaga
      FROM sagas s
      WHERE s.user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error al obtener las sagas:", err);
        return res.status(500).json({ error: "Error al obtener las sagas" });
      }
      res.json(results);
    });
  });
});

module.exports = router;
