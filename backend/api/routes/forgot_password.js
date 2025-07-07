const express = require("express");
const crypto = require("crypto");
const { promisify } = require("util");
const db = require("../../db");
const { sendPasswordResetEmail } = require("../../services/emailService");

// Convertir las funciones de callback a promesas
const query = promisify(db.query).bind(db);

const router = express.Router();

// Ruta para solicitar recuperación de contraseña
router.post("/forgot-password", async (req, res) => {
  console.log("=== INICIO SOLICITUD RECUPERACIÓN CONTRASEÑA ===");
  console.log("Email recibido:", req.body.email);

  try {
    const { email } = req.body;

    // Validar que se proporcionó un email
    if (!email) {
      return res.status(400).json({ error: "El email es obligatorio" });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }

    // Buscar el usuario por email
    const userRows = await query(
      "SELECT id, user, name, mail FROM users WHERE mail = ?",
      [email]
    );

    if (userRows.length === 0) {
      console.log(`Email ${email} no encontrado en la base de datos`);
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({
        message:
          "Si el email existe en nuestra base de datos, recibirás un enlace de recuperación.",
      });
    }

    const user = userRows[0];

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar el token en la base de datos
    await query(
      "UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?",
      [resetToken, resetExpires, user.id]
    );

    console.log(`Token de recuperación generado para usuario ${user.user}`);

    // Enviar email de recuperación
    const emailSent = await sendPasswordResetEmail(
      email,
      resetToken,
      user.name
    );

    if (!emailSent) {
      console.log("Error al enviar email de recuperación");
      // Limpiar el token si falla el envío
      await query(
        "UPDATE users SET password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?",
        [user.id]
      );
      return res
        .status(500)
        .json({ error: "Error al enviar el email de recuperación" });
    }

    console.log(`Email de recuperación enviado exitosamente a ${email}`);
    console.log("=== FIN SOLICITUD RECUPERACIÓN CONTRASEÑA ===");

    res.status(200).json({
      message:
        "Si el email existe en nuestra base de datos, recibirás un enlace de recuperación.",
    });
  } catch (error) {
    console.error("Error en solicitud de recuperación:", error);
    console.log("=== FIN SOLICITUD RECUPERACIÓN CONTRASEÑA - ERROR ===");
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
