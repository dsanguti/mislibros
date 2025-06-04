const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

// Ruta para actualizar un usuario (sólo para administradores)
router.put("/update_user", (req, res) => {
  // Obtener el token de autorización desde los encabezados
  const token = req.headers.authorization?.split(" ")[1]; // Formato: 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Verificar el token JWT
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
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

    const { id, user, password, name, lastname, mail, profile } = req.body;

    try {
      // Verificar que el usuario existe
      db.query(
        "SELECT * FROM users WHERE id = ?",
        [id],
        async (err, results) => {
          if (err) {
            console.error("Error al verificar usuario:", err);
            return res
              .status(500)
              .json({ error: "Error al verificar el usuario" });
          }

          if (results.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
          }

          // Verificar si el nuevo nombre de usuario ya existe (si se está cambiando)
          if (user !== results[0].user) {
            db.query(
              "SELECT * FROM users WHERE user = ? AND id != ?",
              [user, id],
              (err, userResults) => {
                if (err) {
                  console.error("Error al verificar nombre de usuario:", err);
                  return res
                    .status(500)
                    .json({ error: "Error al verificar el nombre de usuario" });
                }

                if (userResults.length > 0) {
                  return res
                    .status(400)
                    .json({ error: "El nombre de usuario ya existe" });
                }
              }
            );
          }

          // Verificar si el nuevo email ya existe (si se está cambiando)
          if (mail !== results[0].mail) {
            db.query(
              "SELECT * FROM users WHERE mail = ? AND id != ?",
              [mail, id],
              (err, emailResults) => {
                if (err) {
                  console.error("Error al verificar email:", err);
                  return res
                    .status(500)
                    .json({ error: "Error al verificar el email" });
                }

                if (emailResults.length > 0) {
                  return res
                    .status(400)
                    .json({ error: "El email ya está registrado" });
                }
              }
            );
          }

          // Actualizar el usuario
          const updateQuery = `
          UPDATE users 
          SET user = ?, 
              password = ?, 
              name = ?, 
              lastname = ?, 
              mail = ?, 
              profile = ? 
          WHERE id = ?
        `;

          db.query(
            updateQuery,
            [user, password, name, lastname, mail, profile, id],
            (err) => {
              if (err) {
                console.error("Error al actualizar usuario:", err);
                return res
                  .status(500)
                  .json({ error: "Error al actualizar el usuario" });
              }

              res.json({
                message: "Usuario actualizado correctamente",
                user: {
                  id,
                  user,
                  name,
                  lastname,
                  mail,
                  profile,
                },
              });
            }
          );
        }
      );
    } catch (error) {
      console.error("Error en la actualización:", error);
      res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  });
});

module.exports = router;
