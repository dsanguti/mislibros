const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

// Ruta para obtener los libros de una saga específica por ID
router.get("/libros-sagas", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token no válido o expirado" });
    }

    const userId = decoded.userId;
    const sagaId = req.query.sagaId;

    if (!sagaId) {
      return res
        .status(400)
        .json({ error: "No se ha proporcionado el ID de la saga" });
    }

    // Obtener los libros que pertenecen a la saga para el usuario autenticado
    const query = `
    SELECT 
      b.id, 
      b.titulo, 
      b.autor, 
      b.sinopsis, 
      b.cover, 
      s.nombre AS nombreSaga,
      g.nombre AS genero
    FROM books b
    JOIN sagas s ON b.saga_id = s.id
    LEFT JOIN genero g ON b.id_genero = g.id
    WHERE b.saga_id = ? AND b.user_id = ?
  `;

    db.query(query, [sagaId, userId], (err, results) => {
      if (err) {
        console.error("Error al obtener los libros de la saga:", err);
        return res
          .status(500)
          .json({ error: "Error al obtener los libros de la saga" });
      }
      res.json(results);
    });
  });
});

module.exports = router;
