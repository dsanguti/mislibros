const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

router.delete("/delete_saga", (req, res) => {
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

    const { id } = req.body;

    console.log("📚 Datos de la saga recibidos:", {
      id: id,
      userId: userId,
    });

    if (!id || isNaN(id)) {
      console.log("❌ Validación fallida:", {
        idEsNumero: !isNaN(id),
      });
      return res
        .status(400)
        .json({ error: "ID de saga inválido o incompleto." });
    }

    // Convertir explícitamente a números para evitar problemas de tipo
    const sagaId = parseInt(id, 10);
    const userIdNum = parseInt(userId, 10);

    console.log("🔢 IDs convertidos:", { sagaId, userIdNum });

    // Primero verificar si la saga existe y pertenece al usuario
    db.query(
      "SELECT id, user_id FROM sagas WHERE id = ?",
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
            .json({ error: "No tienes permiso para eliminar esta saga" });
        }

        // Verificar si hay libros asociados a esta saga
        db.query(
          "SELECT COUNT(*) as count FROM books WHERE saga_id = ?",
          [sagaId],
          (err, bookResults) => {
            if (err) {
              console.error("❌ Error al verificar libros asociados:", err);
              return res
                .status(500)
                .json({ error: "Error al verificar libros asociados" });
            }

            const bookCount = bookResults[0].count;
            console.log("📚 Libros asociados a la saga:", bookCount);

            if (bookCount > 0) {
              return res.status(400).json({
                error:
                  "No se puede eliminar la saga porque tiene libros asociados. Primero debes eliminar o cambiar la saga de esos libros.",
              });
            }

            // Si no hay libros asociados, proceder a eliminar la saga
            db.query(
              "DELETE FROM sagas WHERE id = ? AND user_id = ?",
              [sagaId, userIdNum],
              (err, deleteResult) => {
                if (err) {
                  console.error("❌ Error al eliminar la saga:", err);
                  return res
                    .status(500)
                    .json({ error: "Error al eliminar la saga" });
                }

                console.log("✅ Resultado de la eliminación:", deleteResult);

                res.json({
                  message: "Saga eliminada correctamente",
                });
              }
            );
          }
        );
      }
    );
  });
});

module.exports = router;
