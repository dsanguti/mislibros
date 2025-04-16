const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Asegurar existencia del directorio de subida
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.put("/update_book", upload.single("cover"), (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token no válido o expirado" });

    const userId = decoded.id;
    const id = parseInt(req.body.id, 10);
    const titulo = req.body.titulo;
    const autor = req.body.autor;
    const sinopsis = req.body.sinopsis;
    const saga = req.body.saga || null;
    const id_genero = parseInt(req.body.id_genero, 10); // ← ahora usamos id_genero
    let cover = req.file ? `/uploads/${req.file.filename}` : null;

    // Verificar que el libro pertenece al usuario autenticado
    db.query(
      "SELECT cover FROM books WHERE id = ? AND user_id = ?",
      [id, userId],
      (err, results) => {
        if (err) {
          console.error("❌ Error al verificar el libro:", err);
          return res.status(500).json({ error: "Error al verificar el libro" });
        }

        if (results.length === 0) {
          return res.status(403).json({ error: "No tienes permiso para modificar este libro" });
        }

        // Si no se subió una nueva imagen, usar la actual
        if (!cover) cover = results[0].cover;

        // Obtener coverGenero desde la tabla genero
        db.query(
          "SELECT coverGenero FROM genero WHERE id = ?",
          [id_genero],
          (err, generoResult) => {
            if (err || generoResult.length === 0) {
              console.error("❌ Error al obtener el coverGenero:", err);
              return res.status(500).json({ error: "Error al obtener el género" });
            }

            const coverGenero = generoResult[0].coverGenero;

            // Actualizar libro
            const updateQuery = `
              UPDATE books 
              SET titulo = ?, autor = ?, sinopsis = ?, saga = ?, id_genero = ?, cover = ?, coverGenero = ?
              WHERE id = ? AND user_id = ?
            `;

            db.query(
              updateQuery,
              [titulo, autor, sinopsis, saga, id_genero, cover, coverGenero, id, userId],
              (err, updateResult) => {
                if (err) {
                  console.error("❌ Error al actualizar el libro:", err);
                  return res.status(500).json({ error: "Error al actualizar el libro" });
                }

                if (updateResult.affectedRows === 0) {
                  return res.status(200).json({ message: "No se realizaron cambios en el libro" });
                }

                res.json({ message: "Libro actualizado correctamente", cover, coverGenero });
              }
            );
          }
        );
      }
    );
  });
});

module.exports = router;
