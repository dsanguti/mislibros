const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

// Ruta para eliminar un usuario (sólo para administradores)
router.delete("/delete_user/:id", (req, res) => {
  // Obtener el token de autorización desde los encabezados
  const token = req.headers.authorization?.split(" ")[1]; // Formato: 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Verificar el token JWT
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token no válido o expirado" });
    }

    // Obtener el perfil del usuario del token
    const userProfile = decoded.profile;

    // Verificar si el perfil está presente en el token
    if (userProfile === undefined) {
      return res.status(403).json({
        error:
          "Tu sesión no incluye información de perfil. Por favor, cierra sesión y vuelve a iniciar sesión.",
      });
    }

    // Verificar si el usuario es administrador
    if (userProfile.toLowerCase() !== "admin") {
      return res.status(403).json({
        error: "Acceso denegado. Se requieren permisos de administrador",
      });
    }

    const { id } = req.params;

    // Verificar que el usuario existe
    db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
      if (err) {
        console.error("Error al verificar usuario:", err);
        return res.status(500).json({ error: "Error al verificar el usuario" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Verificar que no sea el último administrador
      if (results[0].profile === "admin") {
        db.query(
          "SELECT COUNT(*) as count FROM users WHERE profile = 'admin'",
          (err, adminResults) => {
            if (err) {
              console.error("Error al contar administradores:", err);
              return res
                .status(500)
                .json({ error: "Error al verificar administradores" });
            }

            if (adminResults[0].count <= 1) {
              return res.status(400).json({
                error:
                  "No se puede eliminar el último administrador del sistema",
              });
            }

            // Si no es el último administrador, proceder con la eliminación
            deleteUser();
          }
        );
      } else {
        // Si no es administrador, proceder directamente con la eliminación
        deleteUser();
      }
    });

    // Función para eliminar el usuario
    function deleteUser() {
      db.query("DELETE FROM users WHERE id = ?", [id], (err) => {
        if (err) {
          console.error("Error al eliminar usuario:", err);
          return res
            .status(500)
            .json({ error: "Error al eliminar el usuario" });
        }

        res.json({
          message: "Usuario eliminado correctamente",
        });
      });
    }
  });
});

module.exports = router;
