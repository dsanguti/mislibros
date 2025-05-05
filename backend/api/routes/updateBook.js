const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "cover") {
      cb(null, "uploads/");
    } else if (file.fieldname === "file") {
      cb(null, "uploads/books/");
    } else {
      cb(null, "uploads/");
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

// Modificar para aceptar múltiples archivos
router.put(
  "/update_book",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
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
          const currentCover = req.files?.cover
            ? req.files.cover[0].path
            : results[0].cover;
          const currentFile = req.files?.file
            ? req.files.file[0].path
            : results[0].file;

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
