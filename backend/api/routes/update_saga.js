const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

router.put("/update_saga", upload.single("coverSaga"), (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log("🔑 Token recibido:", token ? "Sí, presente" : "No presente");

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("❌ Error al verificar el token:", err);
      return res.status(403).json({ error: "Token inválido" });
    }

    console.log("🔑 Token decodificado:", decoded);

    // Obtener userId del token
    const userId =
      decoded.id || decoded.userId || decoded.user_id || decoded.sub;

    console.log("👤 ID del usuario autenticado:", userId);

    if (!userId) {
      console.log("❌ No se pudo encontrar el ID del usuario en el token");
      return res.status(403).json({ error: "Token inválido o incompleto" });
    }

    const { id, nombre } = req.body;

    console.log("📚 Datos de la saga recibidos:", {
      id: id,
      nombre: nombre,
      idParseado: parseInt(id, 10),
      userId: userId,
    });

    if (!nombre || isNaN(id)) {
      console.log("❌ Validación fallida:", {
        nombre: Boolean(nombre),
        idEsNumero: !isNaN(id),
      });
      return res.status(400).json({ error: "Datos inválidos o incompletos." });
    }

    // Convertir explícitamente a números para evitar problemas de tipo
    const sagaId = parseInt(id, 10);
    const userIdNum = parseInt(userId, 10);

    console.log("🔢 IDs convertidos:", { sagaId, userIdNum });

    db.query(
      "SELECT id, coverSaga, user_id FROM sagas WHERE id = ?",
      [sagaId],
      (err, results) => {
        if (err) {
          console.error("❌ Error al verificar la saga:", err);
          return res.status(500).json({ error: "Error al verificar la saga" });
        }

        console.log("🔍 Resultados de la consulta de la saga:", results);

        if (results.length === 0) {
          console.log("❌ No se encontró la saga con ID:", sagaId);
          return res.status(404).json({ error: "La saga no existe" });
        }

        // Comprobar si el usuario es dueño de la saga
        const sagaUserId = results[0].user_id;
        console.log("👥 Comparando user_id:", {
          tokenUserId: userIdNum,
          sagaUserId: sagaUserId,
          sonIguales: userIdNum === sagaUserId,
        });

        if (sagaUserId !== userIdNum) {
          console.log("🚫 El usuario no es dueño de la saga");
          return res
            .status(403)
            .json({ error: "No tienes permiso para modificar esta saga" });
        }

        const currentCover = req.file ? req.file.path : results[0].coverSaga;

        const updateQuery = `
          UPDATE sagas 
          SET nombre = ?, 
              coverSaga = ?
          WHERE id = ? AND user_id = ?
        `;

        const params = [nombre, currentCover, sagaId, userIdNum];

        console.log("🔄 Ejecutando actualización con parámetros:", params);

        db.query(updateQuery, params, (err, updateResult) => {
          if (err) {
            console.error("❌ Error al actualizar la saga:", err);
            return res
              .status(500)
              .json({ error: "Error al actualizar la saga" });
          }

          console.log("✅ Resultado de la actualización:", updateResult);

          res.json({
            message: "Saga actualizada correctamente",
            coverSaga: currentCover,
          });
        });
      }
    );
  });
});

module.exports = router;
