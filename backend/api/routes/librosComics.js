const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db"); // Archivo donde configuraste la conexión a MySQL
const router = express.Router();

// Ruta para obtener los Comics
router.get("/librosComics", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extraer token de 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Verificar el token JWT
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token no válido o expirado" });
    }

    const userId = decoded.id; // ID del usuario desde el token

    // Consulta SQL para obtener los Comics del usuario autenticado
    const sql = `
      SELECT id, titulo, autor, genero, sinopsis, cover 
      FROM books 
      WHERE comics = 1 AND user_id = ?
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
