const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

// Ruta para obtener los libros de Star Wars
router.get("/librosStarwars", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log("🔍 Solicitud de libros Star Wars recibida");

  if (!token) {
    console.log("❌ No se proporcionó token");
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ Token inválido:", err.message);
      return res.status(403).json({ error: "Token no válido o expirado" });
    }

    const userId = decoded.userId;
    console.log("👤 Usuario autenticado:", userId);

    const sql = `
      SELECT 
        b.id, 
        b.titulo, 
        b.autor, 
        b.sinopsis, 
        b.cover,
        b.starwars,
        s.nombre AS nombreSaga,
        g.nombre AS genero
      FROM books b
      LEFT JOIN sagas s ON b.saga_id = s.id
      LEFT JOIN genero g ON b.id_genero = g.id
      WHERE b.starwars = 1 AND b.user_id = ?
    `;

    console.log("🔍 Ejecutando consulta SQL:", sql);
    console.log("🔍 Parámetros:", [userId]);

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("❌ Error al obtener los libros de Star Wars:", err);
        return res
          .status(500)
          .json({ error: "Error al obtener los libros de Star Wars" });
      }

      console.log("✅ Libros de Star Wars encontrados:", results.length);
      console.log("📚 Resultados:", results);

      res.json(results);
    });
  });
});

// Ruta de prueba para verificar todos los libros del usuario
router.get("/debug-starwars", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log("🔍 Solicitud de debug Star Wars recibida");

  if (!token) {
    console.log("❌ No se proporcionó token");
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ Token inválido:", err.message);
      return res.status(403).json({ error: "Token no válido o expirado" });
    }

    const userId = decoded.userId;
    console.log("👤 Usuario autenticado:", userId);

    const sql = `
      SELECT 
        b.id, 
        b.titulo, 
        b.starwars,
        b.comics,
        b.user_id
      FROM books b
      WHERE b.user_id = ?
      ORDER BY b.id DESC
    `;

    console.log("🔍 Ejecutando consulta de debug SQL:", sql);
    console.log("🔍 Parámetros:", [userId]);

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("❌ Error al obtener libros para debug:", err);
        return res
          .status(500)
          .json({ error: "Error al obtener libros para debug" });
      }

      console.log("✅ Libros encontrados para debug:", results.length);
      console.log("📚 Resultados de debug:", results);

      res.json({
        totalBooks: results.length,
        starwarsBooks: results.filter((book) => book.starwars === 1).length,
        comicsBooks: results.filter((book) => book.comics === 1).length,
        books: results,
      });
    });
  });
});

module.exports = router;
