const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db"); // Tu configuración de base de datos
const router = express.Router(); // Router en lugar de app

// Ruta para obtener todos los libros del usuario autenticado
router.get("/all_books", (req, res) => {
  // Obtener el token de autorización desde los encabezados
  const token = req.headers.authorization?.split(" ")[1]; // Formato: 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Verificar el token JWT
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token no válido o expirado" });
    }

    // Obtener el ID del usuario decodificado desde el token
    const userId = decoded.userId;

    // Consulta SQL para obtener todos los libros del usuario con datos de saga y género
    const query = `
      SELECT 
        b.id, 
        b.titulo, 
        b.autor, 
        b.sinopsis, 
        b.cover, 
        b.file,
        b.starwars,
        b.comics,
        s.nombre AS saga, 
        s.coverSaga, 
        g.nombre AS genero, 
        g.coverGenero
      FROM books b
      LEFT JOIN sagas s ON b.saga_id = s.id
      LEFT JOIN genero g ON b.id_genero = g.id
      WHERE b.user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error al obtener los libros" });
      }
      res.json(results); // Enviar los libros como respuesta
    });
  });
});

module.exports = router;
