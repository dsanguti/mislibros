const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();
const { uploadSaga } = require("../../config/cloudinary");

// Ruta para crear una nueva saga
router.post("/create_saga", uploadSaga.single("cover"), (req, res) => {
  try {
    // Verificar token
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("Error de verificación de token:", err);
        return res.status(403).json({ error: "Token inválido" });
      }

      const userId = decoded.userId;
      const { nombre } = req.body;
      let coverPath = null;

      // Verificar si se subió una imagen
      if (req.file) {
        // La imagen se subió a Cloudinary, obtener la URL
        coverPath = req.file.path; // Cloudinary devuelve la URL en path

        console.log("=== DEBUG: Cloudinary para sagas ===");
        console.log("Cover path de Cloudinary:", coverPath);
        console.log("================================================");
      }

      // Validar campos requeridos
      if (!nombre) {
        return res.status(400).json({
          error: "El nombre de la saga es obligatorio",
        });
      }

      // Insertar saga en la base de datos
      const query = `
        INSERT INTO sagas (nombre, coverSaga, user_id)
        VALUES (?, ?, ?)
      `;

      const params = [nombre, coverPath, userId];

      db.query(query, params, (err, result) => {
        if (err) {
          console.error("Error al crear la saga:", err);
          return res
            .status(500)
            .json({ error: "Error al crear la saga: " + err.message });
        }

        res.status(201).json({
          message: "Saga creada correctamente",
          sagaId: result.insertId,
        });
      });
    });
  } catch (error) {
    console.error("Error en la ruta create_saga:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
