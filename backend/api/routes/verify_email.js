const express = require("express");
const { promisify } = require("util");
const db = require("../../db");

// Convertir las funciones de callback a promesas
const query = promisify(db.query).bind(db);

const router = express.Router();

// Ruta para verificar el email
router.get("/verify-email", async (req, res) => {
  console.log("=== INICIO VERIFICACIÓN EMAIL ===");
  const { token } = req.query;
  console.log("Token recibido:", token ? "PRESENTE" : "AUSENTE");
  console.log("Token completo:", token);

  if (!token) {
    console.log("❌ Error: Token no proporcionado");
    return res
      .status(400)
      .json({ error: "Token de verificación no proporcionado" });
  }

  try {
    console.log("🔍 Buscando usuario con token en la base de datos...");

    // Buscar el usuario con el token de verificación
    const userRows = await query(
      "SELECT id, user, name, verification_expires, is_verified FROM users WHERE verification_token = ?",
      [token]
    );

    console.log(
      "📊 Resultados de la búsqueda:",
      userRows.length,
      "usuarios encontrados"
    );

    if (userRows.length > 0) {
      const user = userRows[0];
      console.log("👤 Usuario encontrado:", {
        id: user.id,
        user: user.user,
        name: user.name,
        is_verified: user.is_verified,
        verification_expires: user.verification_expires,
      });
    }

    // Buscar usuarios no verificados con este token
    const unverifiedUserRows = await query(
      "SELECT id, user, name, verification_expires FROM users WHERE verification_token = ? AND is_verified = FALSE",
      [token]
    );

    console.log(
      "📊 Usuarios no verificados con este token:",
      unverifiedUserRows.length
    );

    if (unverifiedUserRows.length === 0) {
      // Verificar si el token existe pero el usuario ya está verificado
      const verifiedUserRows = await query(
        "SELECT id, user, name FROM users WHERE verification_token = ? AND is_verified = TRUE",
        [token]
      );

      if (verifiedUserRows.length > 0) {
        console.log("⚠️ Usuario ya verificado con este token");
        return res
          .status(400)
          .json({ error: "Token de verificación inválido o ya verificado" });
      }

      // Verificar si el token no existe en absoluto
      const anyUserWithToken = await query(
        "SELECT id, user FROM users WHERE verification_token = ?",
        [token]
      );

      if (anyUserWithToken.length === 0) {
        console.log("❌ Token no encontrado en la base de datos");
        return res
          .status(400)
          .json({ error: "Token de verificación inválido o ya verificado" });
      }

      console.log(
        "❌ Token encontrado pero usuario no verificado - error desconocido"
      );
      return res
        .status(400)
        .json({ error: "Token de verificación inválido o ya verificado" });
    }

    const user = unverifiedUserRows[0];
    console.log("✅ Usuario no verificado encontrado:", user.name);

    // Verificar si el token ha expirado
    const now = new Date();
    const expirationDate = new Date(user.verification_expires);
    console.log("⏰ Verificando expiración:");
    console.log("  - Ahora:", now);
    console.log("  - Expira:", expirationDate);
    console.log("  - ¿Ha expirado?:", now > expirationDate);

    if (now > expirationDate) {
      console.log("❌ Token expirado, eliminando usuario");
      // Eliminar el usuario si el token ha expirado
      await query("DELETE FROM users WHERE id = ?", [user.id]);
      return res.status(400).json({
        error:
          "El token de verificación ha expirado. Por favor, solicita un nuevo registro.",
      });
    }

    console.log("✅ Token válido, marcando usuario como verificado...");
    // Marcar el usuario como verificado
    await query(
      "UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_expires = NULL WHERE id = ?",
      [user.id]
    );

    console.log("✅ Usuario verificado exitosamente");
    console.log("=== FIN VERIFICACIÓN EMAIL (ÉXITO) ===");

    // Enviar respuesta HTML de éxito
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verificado - MisLibros</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .container {
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 500px;
          }
          .success-icon {
            color: #4CAF50;
            font-size: 48px;
            margin-bottom: 20px;
          }
          h1 {
            color: #333;
            margin-bottom: 20px;
          }
          p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .button {
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✓</div>
          <h1>¡Email Verificado!</h1>
          <p>Hola <strong>${user.name}</strong>, tu cuenta ha sido verificada exitosamente.</p>
          <p>Ya puedes iniciar sesión en MisLibros con tu usuario: <strong>${user.user}</strong></p>
          <a href="http://localhost:5173" class="button">Ir a MisLibros</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error al verificar email:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
