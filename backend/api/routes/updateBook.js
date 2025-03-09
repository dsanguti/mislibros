const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db"); // Configuración de la base de datos
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Verificar si la carpeta "uploads" existe, si no, crearla
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Ruta para actualizar un libro
router.put("/update_book", upload.single("cover"), (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("❌ No se recibió un token en la petición");
    return res.status(401).json({ error: "No token provided" });
  }

  console.log("🔹 Token recibido:", token);

  // Verificar el token JWT
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ Token no válido:", err.message);
      return res.status(403).json({ error: "Token no válido o expirado" });
    }

    const userId = decoded.id; // ID del usuario autenticado
    console.log("✅ Token válido. Usuario autenticado:", userId);

    console.log("🔎 req.body recibido:", req.body);

    const id = parseInt(req.body.id, 10); // Convertir el ID a número
    const titulo = req.body.titulo;
    const autor = req.body.autor;
    const sinopsis = req.body.sinopsis;
    const saga = req.body.saga || null;
    const nuevoGenero = req.body.genero;
    
    console.log("📌 ID recibido después de convertir:", id);
    
    let cover = req.file ? `/uploads/${req.file.filename}` : null;

    console.log("🔹 Datos recibidos en la petición:");
    console.log("   - ID del libro:", id);
    console.log("   - Título:", titulo);
    console.log("   - Autor:", autor);
    console.log("   - Género:", nuevoGenero);
    console.log("   - Saga:", saga);
    console.log("   - Sinopsis:", sinopsis);
    console.log("   - Cover:", cover);

    // Verificar que el libro pertenece al usuario autenticado
    db.query(
      "SELECT genero, cover, coverGenero FROM books WHERE id = ? AND user_id = ?",
      [id, userId],
      (err, results) => {
        if (err) {
          console.error("❌ Error al verificar el libro en la base de datos:", err);
          return res.status(500).json({ error: "Error al verificar el libro" });
        }

        if (results.length === 0) {
          console.log("❌ No tienes permiso para modificar este libro (ID:", id, "Usuario:", userId, ")");
          return res.status(403).json({ error: "No tienes permiso para modificar este libro" });
        }

        console.log("✅ Permiso concedido. El usuario puede modificar el libro.");

        const generoActual = results[0].genero;
        let coverGenero = results[0].coverGenero;

        // Si el género cambió, asignar la imagen correspondiente
        if (nuevoGenero !== generoActual) {
          coverGenero = `http://localhost:8001/images/generos/${nuevoGenero}.jpeg`;

          // Asegurarse de que la URL usa "http" en lugar de "https"
          coverGenero = coverGenero.replace(/^https:/, "http:");
        }

        // Si no se subió una nueva imagen, mantener la actual
        if (!cover) cover = results[0].cover;

        // Actualizar los datos del libro
        const updateQuery = `
          UPDATE books 
          SET titulo = ?, autor = ?, sinopsis = ?, saga = ?, genero = ?, cover = ?, coverGenero = ?
          WHERE id = ? AND user_id = ?
        `;

        db.query(updateQuery, [titulo, autor, sinopsis, saga || null, nuevoGenero, cover, coverGenero, id, userId], (err, updateResult) => {
          if (err) {
            console.error("❌ Error al actualizar el libro:", err);
            return res.status(500).json({ error: "Error al actualizar el libro" });
          }

          // Verificar si realmente se actualizó algún registro
          if (updateResult.affectedRows === 0) {
            console.log("⚠️ No se realizaron cambios en el libro.");
            return res.status(200).json({ message: "No se realizaron cambios en el libro" });
          }

          console.log("✅ Libro actualizado correctamente. Nueva coverGenero:", coverGenero);
          res.json({ message: "Libro actualizado correctamente", cover, coverGenero });
        });
      }
    );
  });
});

module.exports = router;
