const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

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
      "SELECT id, cover, user_id FROM books WHERE id = ?",
      [bookId],
      (err, results) => {
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

        // Proceder con la eliminación
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
