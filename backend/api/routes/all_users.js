const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

// Ruta para obtener todos los usuarios (sólo para administradores)
router.get("/all_users", (req, res) => {
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

    console.log("Token decodificado:", decoded); // Para depuración

    // Obtener el perfil del usuario del token
    const userProfile = decoded.profile;

    // Verificar si el perfil está presente en el token
    if (userProfile === undefined) {
      console.log("El perfil de usuario no está incluido en el token");
      return res.status(403).json({
        error:
          "Tu sesión no incluye información de perfil. Por favor, cierra sesión y vuelve a iniciar sesión.",
      });
    }

    // Verificar si el usuario es administrador (profile = 'admin')
    if (userProfile.toLowerCase() !== "admin") {
      console.log(
        `El usuario tiene perfil ${userProfile}, pero se requiere 'admin'`
      );
      return res.status(403).json({
        error: "Acceso denegado. Se requieren permisos de administrador",
      });
    }

    // Consulta SQL para obtener todos los usuarios (excepto contraseñas)
    const query = `
      SELECT 
        id, 
        user,
        name, 
        lastname, 
        mail, 
        profile
      FROM users
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error al obtener usuarios:", err);
        return res.status(500).json({ error: "Error al obtener los usuarios" });
      }
      res.json(results); // Enviar los usuarios como respuesta
    });
  });
});

module.exports = router;
