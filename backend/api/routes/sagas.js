const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

// Endpoint de debug para verificar autenticación
router.get("/sagas-debug", (req, res) => {
  console.log("=== DEBUG SAGAS ===");
  console.log("Headers:", req.headers);
  console.log("Authorization header:", req.headers.authorization);

  const token = req.headers.authorization?.split(" ")[1];
  console.log("Token extraído:", token ? "PRESENTE" : "AUSENTE");

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({
      error: "No token provided",
      debug: {
        headers: req.headers,
        authorization: req.headers.authorization,
      },
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ Token inválido:", err.message);
      return res.status(403).json({
        error: "Token no válido o expirado",
        debug: {
          tokenError: err.message,
          token: token.substring(0, 20) + "...",
        },
      });
    }

    console.log("✅ Token válido, decoded:", decoded);
    const userId = decoded.userId;
    console.log("User ID:", userId);

    // Obtener todas las sagas del usuario
    const query = `
      SELECT s.id, s.nombre, s.coverSaga, s.user_id
      FROM sagas s
      WHERE s.user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("❌ Error al obtener las sagas:", err);
        return res.status(500).json({
          error: "Error al obtener las sagas",
          debug: {
            databaseError: err.message,
            userId: userId,
          },
        });
      }

      console.log("✅ Sagas encontradas:", results.length);
      console.log("Sagas:", results);

      res.json({
        success: true,
        sagas: results,
        debug: {
          userId: userId,
          sagasCount: results.length,
          tokenDecoded: decoded,
        },
      });
    });
  });
});

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
