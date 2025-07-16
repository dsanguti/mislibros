const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

// Endpoint para debug de sagas antiguas vs nuevas
router.get("/sagas-compare", (req, res) => {
  console.log("=== COMPARAR SAGAS ANTIGUAS VS NUEVAS ===");

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }

    const userId = decoded.userId;
    console.log("User ID:", userId);

    // Query simplificado para evitar errores
    const query = `
      SELECT 
        s.id, 
        s.nombre, 
        s.coverSaga, 
        s.user_id,
        s.created_at,
        s.updated_at
      FROM sagas s
      WHERE s.user_id = ?
      ORDER BY s.created_at ASC
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error al obtener las sagas:", err);
        return res.status(500).json({
          error: "Error al obtener las sagas",
          details: err.message,
        });
      }

      console.log("Sagas encontradas:", results.length);
      console.log("Sagas:", results);

      // Separar sagas antiguas y nuevas (por ejemplo, antes y después de una fecha)
      const sagasAntiguas = results.filter((saga) => {
        if (!saga.created_at) return false;
        const createdAt = new Date(saga.created_at);
        const fechaLimite = new Date("2025-07-16T17:00:00Z"); // Ajusta esta fecha
        return createdAt < fechaLimite;
      });

      const sagasNuevas = results.filter((saga) => {
        if (!saga.created_at) return true; // Si no tiene fecha, considerarla nueva
        const createdAt = new Date(saga.created_at);
        const fechaLimite = new Date("2025-07-16T17:00:00Z"); // Ajusta esta fecha
        return createdAt >= fechaLimite;
      });

      res.json({
        success: true,
        userId: userId,
        totalSagas: results.length,
        sagasAntiguas: {
          count: sagasAntiguas.length,
          sagas: sagasAntiguas,
        },
        sagasNuevas: {
          count: sagasNuevas.length,
          sagas: sagasNuevas,
        },
        todasLasSagas: results,
        debug: {
          userAgent: req.headers["user-agent"],
          timestamp: new Date().toISOString(),
        },
      });
    });
  });
});

// Endpoint específico para probar desde móvil
router.get("/sagas-mobile-test", (req, res) => {
  console.log("=== MOBILE TEST SAGAS ===");
  console.log("User-Agent:", req.headers["user-agent"]);
  console.log("Origin:", req.headers["origin"]);
  console.log("Referer:", req.headers["referer"]);
  console.log(
    "Authorization header:",
    req.headers.authorization ? "PRESENTE" : "AUSENTE"
  );

  // Permitir CORS para móvil
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.json({
      success: false,
      error: "No token provided",
      debug: {
        userAgent: req.headers["user-agent"],
        origin: req.headers["origin"],
        referer: req.headers["referer"],
        authorization: "AUSENTE",
        timestamp: new Date().toISOString(),
      },
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.json({
        success: false,
        error: "Token inválido",
        debug: {
          tokenError: err.message,
          userAgent: req.headers["user-agent"],
          timestamp: new Date().toISOString(),
        },
      });
    }

    const userId = decoded.userId;

    // Obtener sagas
    const query = `SELECT s.id, s.nombre, s.coverSaga, s.user_id FROM sagas s WHERE s.user_id = ?`;

    db.query(query, [userId], (err, results) => {
      if (err) {
        return res.json({
          success: false,
          error: "Error de base de datos",
          debug: {
            databaseError: err.message,
            userId: userId,
            userAgent: req.headers["user-agent"],
            timestamp: new Date().toISOString(),
          },
        });
      }

      return res.json({
        success: true,
        sagas: results,
        debug: {
          userId: userId,
          sagasCount: results.length,
          userAgent: req.headers["user-agent"],
          origin: req.headers["origin"],
          timestamp: new Date().toISOString(),
        },
      });
    });
  });
});

// Endpoint de debug para verificar autenticación
router.get("/sagas-debug", (req, res) => {
  console.log("=== DEBUG SAGAS ===");
  console.log("User-Agent:", req.headers["user-agent"]);
  console.log("Origin:", req.headers["origin"]);
  console.log("Referer:", req.headers["referer"]);
  console.log(
    "Authorization header:",
    req.headers.authorization ? "PRESENTE" : "AUSENTE"
  );

  const token = req.headers.authorization?.split(" ")[1];
  console.log("Token extraído:", token ? "PRESENTE" : "AUSENTE");

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({
      error: "No token provided",
      debug: {
        userAgent: req.headers["user-agent"],
        origin: req.headers["origin"],
        referer: req.headers["referer"],
        authorization: req.headers.authorization ? "PRESENTE" : "AUSENTE",
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
          userAgent: req.headers["user-agent"],
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
            userAgent: req.headers["user-agent"],
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
          userAgent: req.headers["user-agent"],
          origin: req.headers["origin"],
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
