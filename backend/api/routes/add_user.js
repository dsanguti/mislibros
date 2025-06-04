const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

// Ruta para añadir un nuevo usuario (sólo para administradores)
router.post("/add_user", async (req, res) => {
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

    const { user, password, name, lastname, mail, profile } = req.body;

    try {
      // Verificar si el nombre de usuario ya existe
      db.query(
        "SELECT * FROM users WHERE user = ?",
        [user],
        async (err, results) => {
          if (err) {
            console.error("Error al verificar nombre de usuario:", err);
            return res
              .status(500)
              .json({ error: "Error al verificar el nombre de usuario" });
          }

          if (results.length > 0) {
            return res
              .status(400)
              .json({ error: "El nombre de usuario ya existe" });
          }

          // Verificar si el email ya existe
          db.query(
            "SELECT * FROM users WHERE mail = ?",
            [mail],
            async (err, emailResults) => {
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

              // Insertar el nuevo usuario
              const insertQuery = `
                INSERT INTO users (user, password, name, lastname, mail, profile)
                VALUES (?, ?, ?, ?, ?, ?)
              `;

              db.query(
                insertQuery,
                [user, password, name, lastname, mail, profile],
                (err, results) => {
                  if (err) {
                    console.error("Error al crear usuario:", err);
                    return res
                      .status(500)
                      .json({ error: "Error al crear el usuario" });
                  }

                  res.status(201).json({
                    message: "Usuario creado correctamente",
                    user: {
                      id: results.insertId,
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
        }
      );
    } catch (error) {
      console.error("Error en la creación:", error);
      res.status(500).json({ error: "Error al crear el usuario" });
    }
  });
});

module.exports = router;
