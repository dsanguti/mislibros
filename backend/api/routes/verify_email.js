const express = require("express");
const { promisify } = require("util");
const db = require("../../db");

// Convertir las funciones de callback a promesas
const query = promisify(db.query).bind(db);

const router = express.Router();

// Ruta para verificar el email
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res
      .status(400)
      .json({ error: "Token de verificación no proporcionado" });
  }

  try {
    // Buscar el usuario con el token de verificación
    const userRows = await query(
      "SELECT id, user, name, verification_expires FROM users WHERE verification_token = ? AND is_verified = FALSE",
      [token]
    );

    if (userRows.length === 0) {
      return res
        .status(400)
        .json({ error: "Token de verificación inválido o ya verificado" });
    }

    const user = userRows[0];

    // Verificar si el token ha expirado
    const now = new Date();
    const expirationDate = new Date(user.verification_expires);

    if (now > expirationDate) {
      // Eliminar el usuario si el token ha expirado
      await query("DELETE FROM users WHERE id = ?", [user.id]);
      return res.status(400).json({
        error:
          "El token de verificación ha expirado. Por favor, solicita un nuevo registro.",
      });
    }

    // Marcar el usuario como verificado
    await query(
      "UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_expires = NULL WHERE id = ?",
      [user.id]
    );

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
