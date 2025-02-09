const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db"); // Asegúrate de que la configuración de la DB es correcta
const router = express.Router();

router.get("/libros-genero", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Verificar el token JWT
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token no válido o expirado" });
    }

    const userId = decoded.id;
    const { genero } = req.query; // Obtener el género desde la query

    if (!genero) {
      return res.status(400).json({ error: "Falta el parámetro género" });
    }

    // Consulta a la base de datos para obtener los libros del género seleccionado
    db.query(
      "SELECT id, titulo, autor, genero, sinopsis, cover FROM books WHERE genero = ? AND user_id = ?",
      [genero, userId],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Error al obtener los libros" });
        }
        res.json(results);
      }
    );
  });
});

module.exports = router;
