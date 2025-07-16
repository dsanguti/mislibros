const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();
const path = require("path"); // Added for path.basename
const { uploadCover } = require("../../config/cloudinary");

// Configuración de multer para almacenar archivos de libros (no imágenes)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "file") {
      cb(null, "uploads/books/");
    } else {
      cb(new Error("Campo de archivo no válido"), null);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const uploadBook = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Solo permitir archivos de libros
    if (file.fieldname === "file") {
      const allowedTypes = [
        "application/epub+zip",
        "application/pdf",
        "application/x-mobipocket-ebook",
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Tipo de archivo no permitido para el libro"), false);
      }
    } else {
      cb(new Error("Campo de archivo no válido"), false);
    }
  },
});

// Modificar para aceptar múltiples archivos
router.put(
  "/update_book",
  uploadBook.single("file"),
  uploadCover.single("cover"),
  (req, res) => {
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

      // Obtener userId del token (ahora sabemos que está en decoded.id)
      const userId =
        decoded.id || decoded.userId || decoded.user_id || decoded.sub;

      console.log("👤 ID del usuario autenticado:", userId);

      if (!userId) {
        console.log("❌ No se pudo encontrar el ID del usuario en el token");
        return res.status(403).json({ error: "Token inválido o incompleto" });
      }

      const {
        id,
        titulo,
        autor,
        sinopsis,
        id_genero,
        saga_id,
        starwars,
        comics,
      } = req.body;

      console.log("📚 Datos del libro recibidos:", {
        id: id,
        titulo: titulo,
        idParseado: parseInt(id, 10),
        userId: userId,
        saga_id: saga_id,
        starwars: starwars,
        comics: comics,
      });

      if (!titulo || !autor || isNaN(id) || isNaN(id_genero)) {
        console.log("❌ Validación fallida:", {
          titulo: Boolean(titulo),
          autor: Boolean(autor),
          idEsNumero: !isNaN(id),
          idGeneroEsNumero: !isNaN(id_genero),
        });
        return res
          .status(400)
          .json({ error: "Datos inválidos o incompletos." });
      }

      // Convertir explícitamente a números para evitar problemas de tipo
      const bookId = parseInt(id, 10);
      const userIdNum = parseInt(userId, 10);

      console.log("🔢 IDs convertidos:", { bookId, userIdNum });

      db.query(
        "SELECT id, cover, file, user_id FROM books WHERE id = ?",
        [bookId],
        (err, results) => {
          if (err) {
            console.error("❌ Error al verificar el libro:", err);
            return res
              .status(500)
              .json({ error: "Error al verificar el libro" });
          }

          console.log("🔍 Resultados de la consulta del libro:", results);

          if (results.length === 0) {
            console.log("❌ No se encontró el libro con ID:", bookId);
            return res.status(404).json({ error: "El libro no existe" });
          }

          // Comprobar si el usuario es dueño del libro
          const bookUserId = results[0].user_id;
          console.log("👥 Comparando user_id:", {
            tokenUserId: userIdNum,
            bookUserId: bookUserId,
            sonIguales: userIdNum === bookUserId,
          });

          if (bookUserId !== userIdNum) {
            console.log("🚫 El usuario no es dueño del libro");
            return res
              .status(403)
              .json({ error: "No tienes permiso para modificar este libro" });
          }

          // Mantener los valores actuales si no se proporcionan nuevos
          let currentCover = results[0].cover;
          let currentFile = results[0].file;

          // Si se subió una nueva imagen de portada (Cloudinary)
          if (req.files && req.files.cover && req.files.cover[0]) {
            // La imagen se subió a Cloudinary, obtener la URL
            currentCover = req.files.cover[0].path; // Cloudinary devuelve la URL en path

            console.log("Nueva imagen de portada (Cloudinary):", {
              originalName: req.files.cover[0].originalname,
              cloudinaryUrl: currentCover,
            });
          }

          // Logging detallado para diagnóstico
          console.log("=== DIAGNÓSTICO CLOUDINARY ===");
          console.log("req.files:", req.files);
          console.log("req.file:", req.file);
          console.log("Variables de entorno Cloudinary:");
          console.log(
            "CLOUDINARY_CLOUD_NAME:",
            process.env.CLOUDINARY_CLOUD_NAME ? "SET" : "NOT SET"
          );
          console.log(
            "CLOUDINARY_API_KEY:",
            process.env.CLOUDINARY_API_KEY ? "SET" : "NOT SET"
          );
          console.log(
            "CLOUDINARY_API_SECRET:",
            process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET"
          );
          console.log("NODE_ENV:", process.env.NODE_ENV);
          console.log("currentCover final:", currentCover);
          console.log("================================================");

          // Si se subió un nuevo archivo, generar la URL correcta
          if (req.file) {
            const fileFileName = path.basename(req.file.path);
            // Usar URL dinámica basada en el entorno
            const backendUrl =
              process.env.NODE_ENV === "production"
                ? "https://mislibros-production.up.railway.app"
                : `http://localhost:${process.env.PORT || 8001}`;
            currentFile = `${backendUrl}/uploads/books/${fileFileName}`;

            console.log("Nuevo archivo:", {
              originalPath: req.file.path,
              fileName: fileFileName,
              newUrl: currentFile,
              environment: process.env.NODE_ENV,
              backendUrl: backendUrl,
            });
          }

          db.query(
            "SELECT coverGenero FROM genero WHERE id = ?",
            [id_genero],
            (err, generoResult) => {
              if (err) {
                console.error("❌ Error al obtener el género:", err);
                return res
                  .status(500)
                  .json({ error: "Error al obtener el género" });
              }

              if (generoResult.length === 0) {
                console.log("❌ No se encontró el género con ID:", id_genero);
                return res.status(404).json({ error: "El género no existe" });
              }

              const coverGenero = generoResult[0].coverGenero;
              console.log("🎭 Género encontrado:", { coverGenero });

              // Convertir saga_id a null si está vacío o a número si existe
              const finalSagaId =
                saga_id && saga_id.trim && saga_id.trim() !== ""
                  ? Number(saga_id)
                  : null;
              console.log("📚 ID de saga final:", finalSagaId);

              // Convertir starwars y comics a booleanos
              const isStarWars =
                starwars === "1" || starwars === "true" || starwars === true;
              const isComics =
                comics === "1" || comics === "true" || comics === true;

              console.log("Valores convertidos:", {
                starwars,
                comics,
                isStarWars,
                isComics,
              });

              const updateQuery = `
                UPDATE books 
                SET titulo = ?, 
                    autor = ?, 
                    sinopsis = ?, 
                    saga_id = ?, 
                    id_genero = ?, 
                    cover = ?,
                    file = ?,
                    starwars = ?,
                    comics = ?
                WHERE id = ? AND user_id = ?
              `;

              const params = [
                titulo,
                autor,
                sinopsis,
                finalSagaId,
                id_genero,
                currentCover,
                currentFile,
                isStarWars,
                isComics,
                bookId,
                userIdNum,
              ];

              console.log(
                "🔄 Ejecutando actualización con parámetros:",
                params
              );

              db.query(updateQuery, params, (err, updateResult) => {
                if (err) {
                  console.error("❌ Error al actualizar el libro:", err);
                  return res
                    .status(500)
                    .json({ error: "Error al actualizar el libro" });
                }

                console.log("✅ Resultado de la actualización:", updateResult);

                res.json({
                  message: "Libro actualizado correctamente",
                  cover: currentCover,
                  file: currentFile,
                  coverGenero,
                });
              });
            }
          );
        }
      );
    });
  }
);

module.exports = router;
