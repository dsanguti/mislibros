const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { cloudinary } = require("../../config/cloudinary");

// Asegurar que los directorios necesarios existan
const ensureDirectoriesExist = () => {
  const directories = [
    path.join(__dirname, "../../uploads/books"),
    path.join(__dirname, "../../images/cover"),
    path.join(__dirname, "../../uploads/temp"),
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directorio creado: ${dir}`);
    }
  });
};

ensureDirectoriesExist();

// Configuración de multer para almacenar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "file") {
      cb(null, "uploads/books/");
    } else if (file.fieldname === "cover") {
      // En desarrollo: usar directorio local, en producción: temporal para Cloudinary
      if (process.env.NODE_ENV === "production") {
        cb(null, "uploads/temp/");
      } else {
        cb(null, "images/cover/");
      }
    } else {
      cb(new Error("Campo de archivo no válido"), null);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "file") {
      // Permitir archivos de libros
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
    } else if (file.fieldname === "cover") {
      // Permitir imágenes
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Tipo de archivo no permitido para la portada"), false);
      }
    } else {
      cb(new Error("Campo de archivo no válido"), false);
    }
  },
});

// Modificar para aceptar múltiples archivos
router.put(
  "/update_book",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    console.log("🔑 Token recibido:", token ? "Sí, presente" : "No presente");

    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
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
        async (err, results) => {
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

          // Si se subió una nueva imagen de portada
          if (req.files && req.files.cover && req.files.cover[0]) {
            console.log("=== DIAGNÓSTICO NODE_ENV ===");
            console.log("NODE_ENV actual:", process.env.NODE_ENV);
            console.log(
              "¿Es producción?",
              process.env.NODE_ENV === "production"
            );
            console.log(
              "¿Es desarrollo?",
              process.env.NODE_ENV === "development"
            );
            console.log("¿Está definido?", process.env.NODE_ENV ? "SÍ" : "NO");
            console.log("================================================");

            if (process.env.NODE_ENV === "production") {
              // En producción: subir a Cloudinary
              try {
                // Verificar que Cloudinary esté configurado
                if (
                  !process.env.CLOUDINARY_CLOUD_NAME ||
                  !process.env.CLOUDINARY_API_KEY ||
                  !process.env.CLOUDINARY_API_SECRET
                ) {
                  console.error("❌ Error: Faltan credenciales de Cloudinary");
                  return res.status(500).json({
                    error:
                      "Error de configuración: faltan credenciales de Cloudinary",
                  });
                }

                console.log("Subiendo imagen a Cloudinary...");
                const result = await cloudinary.uploader.upload(
                  req.files.cover[0].path,
                  {
                    folder: "mislibros/covers",
                    transformation: [
                      { width: 400, height: 600, crop: "fill" },
                      { quality: "auto" },
                    ],
                  }
                );

                currentCover = result.secure_url;
                console.log("Imagen subida a Cloudinary:", currentCover);

                // Eliminar archivo temporal
                fs.unlinkSync(req.files.cover[0].path);
              } catch (uploadError) {
                console.error(
                  "Error al subir imagen a Cloudinary:",
                  uploadError
                );

                // Proporcionar mensaje de error más específico
                let errorMessage = "Error al subir la imagen";
                if (uploadError.http_code === 401) {
                  errorMessage =
                    "Error de autenticación con Cloudinary - verifica las credenciales";
                } else if (uploadError.http_code === 400) {
                  errorMessage = "Error en el formato de la imagen";
                }

                return res.status(500).json({ error: errorMessage });
              }
            } else {
              // En desarrollo: usar URL local
              console.log("Usando almacenamiento local para desarrollo");
              const coverFileName = path.basename(req.files.cover[0].path);
              const backendUrl = `http://localhost:${process.env.PORT || 8001}`;
              currentCover = `${backendUrl}/images/cover/${coverFileName}`;

              console.log("Imagen guardada localmente:", currentCover);
            }
          }

          // Si se subió un nuevo archivo, generar la URL correcta
          if (req.files && req.files.file && req.files.file[0]) {
            const fileFileName = path.basename(req.files.file[0].path);
            // Usar URL dinámica basada en el entorno
            const backendUrl =
              process.env.NODE_ENV === "production"
                ? "https://mislibros-production.up.railway.app"
                : `http://localhost:${process.env.PORT || 10000}`;
            currentFile = `${backendUrl}/uploads/books/${fileFileName}`;

            console.log("Nuevo archivo:", {
              originalPath: req.files.file[0].path,
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
