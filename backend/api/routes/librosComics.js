const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

// Ruta para obtener los Comics
router.get("/librosComics", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token no válido o expirado" });
    }

    const userId = decoded.userId;

    const sql = `
      SELECT 
        b.id, 
        b.titulo, 
        b.autor, 
        b.sinopsis, 
        b.cover,
        b.file,
        s.nombre AS nombreSaga,
        g.nombre AS genero
      FROM books b
      LEFT JOIN sagas s ON b.saga_id = s.id
      LEFT JOIN genero g ON b.id_genero = g.id
      WHERE b.comics = 1 AND b.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Error al obtener los Comics: ", err);
        return res.status(500).json({ error: "Error al obtener los Comics" });
      }
      res.json(results);
    });
  });
});

module.exports = router;
