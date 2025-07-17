const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Endpoint para descargar archivos de libros
router.get("/download-book/:bookId", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const bookId = req.params.bookId;

  console.log("=== DOWNLOAD BOOK REQUEST ===");
  console.log("Book ID:", bookId);
  console.log("Token present:", !!token);
  console.log("=============================");

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(403).json({ error: "Token inválido" });
    }

    const userId = decoded.userId;
    console.log("User ID from token:", userId);

    // Verificar que el libro pertenece al usuario
    const query = "SELECT file, titulo FROM books WHERE id = ? AND user_id = ?";

    db.query(query, [bookId, userId], (err, results) => {
      if (err) {
        console.error("Error al consultar el libro:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }

      console.log("Query results:", results);

      if (results.length === 0) {
        return res.status(404).json({ error: "Libro no encontrado" });
      }

      const book = results[0];

      if (!book.file) {
        return res.status(404).json({ error: "Archivo no disponible" });
      }

      // Extraer el nombre del archivo de la URL
      const fileName = path.basename(book.file);
      const filePath = path.join(__dirname, "../../uploads/books", fileName);

      console.log("File path:", filePath);
      console.log("File exists:", fs.existsSync(filePath));

      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        console.error("Archivo no encontrado:", filePath);
        return res
          .status(404)
          .json({ error: "Archivo no encontrado en el servidor" });
      }

      // Configurar headers para la descarga
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(book.titulo)}.epub"`
      );

      // Enviar el archivo
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error("Error al enviar archivo:", err);
          if (!res.headersSent) {
            res.status(500).json({ error: "Error al enviar el archivo" });
          }
        } else {
          console.log("Archivo enviado correctamente");
        }
      });
    });
  });
});

module.exports = router;
