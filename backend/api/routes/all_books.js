const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db"); // Tu configuración de base de datos
const router = express.Router(); // Cambiado de app a router

// Ruta para obtener todos los libros del usuario
router.get("/all_books", (req, res) => { 
  // Obtener el token de autorización desde los encabezados
  const token = req.headers.authorization?.split(" ")[1]; // 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Verificar el token JWT
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token no válido o expirado" });
    }

    // Si el token es válido, obtenemos el ID del usuario decodificado
    const userId = decoded.id;

    // Consultar la base de datos para obtener todos los libros del usuario
    db.query(
      "SELECT id, titulo, autor, sinopsis, saga, genero, cover FROM books WHERE user_id = ?",
      [userId],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Error al obtener los libros" });
        }
        res.json(results); // Enviar los libros como respuesta
      }
    );
  });
});

module.exports = router; // Exportar el router