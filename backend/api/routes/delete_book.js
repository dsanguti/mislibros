const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { deleteCloudinaryFile } = require("../../config/cloudinary");

router.delete("/delete_book/:id", (req, res) => {
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

    const bookId = parseInt(req.params.id, 10);
    const userIdNum = parseInt(userId, 10);

    if (isNaN(bookId)) {
      console.log("❌ ID de libro inválido:", req.params.id);
      return res.status(400).json({ error: "ID de libro inválido" });
    }

    console.log("🔢 IDs a procesar:", { bookId, userIdNum });

    // Primero verificar que el libro existe y pertenece al usuario
    db.query(
      "SELECT id, file, cover, user_id FROM books WHERE id = ?",
      [bookId],
      async (err, results) => {
        if (err) {
          console.error("❌ Error al verificar el libro:", err);
          return res.status(500).json({ error: "Error al verificar el libro" });
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
            .json({ error: "No tienes permiso para eliminar este libro" });
        }

        // Obtener las rutas de los archivos
        const bookFile = results[0].file;
        const coverFile = results[0].cover;

        console.log("📚 URLs de archivos del libro:");
        console.log(`   📖 Archivo del libro: ${bookFile}`);
        console.log(`   🖼️  Carátula: ${coverFile}`);

        // Función para eliminar archivos (locales y Cloudinary)
        const deleteFile = async (filePath) => {
          if (!filePath) {
            console.log("⚠️  No hay ruta de archivo para eliminar");
            return;
          }

          console.log(`🔍 Procesando archivo: ${filePath}`);

          // Si es un archivo de Cloudinary, eliminarlo de ahí
          if (filePath.includes("cloudinary.com")) {
            console.log("☁️  Detectado archivo de Cloudinary");
            try {
              // Determinar el tipo de recurso basado en la URL
              const resourceType = filePath.includes("/books/")
                ? "raw"
                : "image";
              console.log(`📁 Tipo de recurso detectado: ${resourceType}`);
              console.log(`🔗 URL completa: ${filePath}`);

              await deleteCloudinaryFile(filePath, resourceType);
              console.log(`✅ Archivo eliminado de Cloudinary: ${filePath}`);
            } catch (error) {
              console.error(
                `❌ Error al eliminar archivo de Cloudinary ${filePath}:`,
                error
              );
            }
          } else {
            console.log("💾 Detectado archivo local");
            // Es un archivo local, eliminarlo del sistema de archivos
            const fileName = path.basename(filePath);
            let fullPath;

            if (filePath.includes("/images/cover/")) {
              fullPath = path.join(__dirname, "../../images/cover", fileName);
            } else if (filePath.includes("/uploads/books/")) {
              fullPath = path.join(__dirname, "../../uploads/books", fileName);
            }

            if (fullPath && fs.existsSync(fullPath)) {
              try {
                fs.unlinkSync(fullPath);
                console.log(`✅ Archivo local eliminado: ${fullPath}`);
              } catch (error) {
                console.error(
                  `❌ Error al eliminar el archivo local ${fullPath}:`,
                  error
                );
              }
            } else {
              console.log(`⚠️  Archivo local no encontrado: ${fullPath}`);
            }
          }
        };

        // Eliminar los archivos (locales y/o Cloudinary)
        try {
          await deleteFile(bookFile);
          await deleteFile(coverFile);
        } catch (error) {
          console.error("Error al eliminar archivos:", error);
        }

        // Proceder con la eliminación del registro en la base de datos
        db.query(
          "DELETE FROM books WHERE id = ? AND user_id = ?",
          [bookId, userIdNum],
          (err, deleteResult) => {
            if (err) {
              console.error("❌ Error al eliminar el libro:", err);
              return res
                .status(500)
                .json({ error: "Error al eliminar el libro" });
            }

            console.log("✅ Resultado de la eliminación:", deleteResult);

            res.json({
              message: "Libro eliminado correctamente",
              deletedBookId: bookId,
            });
          }
        );
      }
    );
  });
});

module.exports = router;

// Endpoint de prueba para verificar Cloudinary
router.get("/test-cloudinary/:url(*)", async (req, res) => {
  try {
    const { url } = req.params;
    const { extractPublicId } = require("../../config/cloudinary");

    console.log("🔍 Probando URL:", url);

    const publicId = extractPublicId(url);
    console.log("📋 Public ID extraído:", publicId);

    if (!publicId) {
      return res.json({
        success: false,
        message: "No se pudo extraer public_id de la URL",
        url: url,
      });
    }

    // Solo extraer el public_id, no eliminar
    res.json({
      success: true,
      message: "Public ID extraído correctamente",
      url: url,
      publicId: publicId,
    });
  } catch (error) {
    console.error("Error en test-cloudinary:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la URL",
      error: error.message,
    });
  }
});

// Endpoint de debug para ver URLs de Cloudinary en la base de datos
router.get("/debug-cloudinary-urls", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        return res.status(403).json({ error: "Token inválido" });
      }

      // Obtener libros con URLs de Cloudinary
      db.query(
        "SELECT id, titulo, cover, file FROM books WHERE cover LIKE '%cloudinary.com%' OR file LIKE '%cloudinary.com%'",
        (err, bookResults) => {
          if (err) {
            console.error("Error al consultar libros:", err);
            return res
              .status(500)
              .json({ error: "Error interno del servidor" });
          }

          // Obtener sagas con URLs de Cloudinary
          db.query(
            "SELECT id, nombre, coverSaga FROM sagas WHERE coverSaga LIKE '%cloudinary.com%'",
            (err, sagaResults) => {
              if (err) {
                console.error("Error al consultar sagas:", err);
                return res
                  .status(500)
                  .json({ error: "Error interno del servidor" });
              }

              res.json({
                books: bookResults,
                sagas: sagaResults,
                totalBooks: bookResults.length,
                totalSagas: sagaResults.length,
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Error en debug-cloudinary-urls:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener URLs",
      error: error.message,
    });
  }
});
