const express = require("express");
const bcrypt = require("bcrypt");
const { promisify } = require("util");
const db = require("../../db");

// Convertir las funciones de callback a promesas
const query = promisify(db.query).bind(db);

const router = express.Router();

// Función para validar contraseña
const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Debe contener al menos una mayúscula");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Debe contener al menos una minúscula");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Debe contener al menos un número");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Debe contener al menos un carácter especial");
  }

  return errors;
};

// Ruta para cambiar contraseña usando token de recuperación
router.post("/reset-password", async (req, res) => {
  console.log("=== INICIO CAMBIO CONTRASEÑA ===");
  console.log("Datos recibidos:", {
    token: req.body.token ? "PRESENTE" : "AUSENTE",
    hasPassword: !!req.body.password,
  });

  try {
    const { token, password } = req.body;

    // Validar que se proporcionaron todos los datos
    if (!token || !password) {
      return res
        .status(400)
        .json({ error: "Token y nueva contraseña son obligatorios" });
    }

    // Validar la nueva contraseña
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        error: "La contraseña no cumple con los requisitos de seguridad",
        details: passwordErrors,
      });
    }

    // Buscar el usuario con el token de recuperación
    const userRows = await query(
      "SELECT id, user, name, password_reset_expires FROM users WHERE password_reset_token = ?",
      [token]
    );

    if (userRows.length === 0) {
      console.log("Token de recuperación no encontrado");
      return res
        .status(400)
        .json({ error: "Token de recuperación inválido o expirado" });
    }

    const user = userRows[0];

    // Verificar si el token ha expirado
    const now = new Date();
    const expirationDate = new Date(user.password_reset_expires);

    if (now > expirationDate) {
      console.log("Token de recuperación expirado");
      // Limpiar el token expirado
      await query(
        "UPDATE users SET password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?",
        [user.id]
      );
      return res.status(400).json({
        error: "El enlace de recuperación ha expirado. Solicita uno nuevo.",
      });
    }

    // Hashear la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Actualizar la contraseña y limpiar el token
    await query(
      "UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    console.log(
      `Contraseña actualizada exitosamente para usuario ${user.user}`
    );
    console.log("=== FIN CAMBIO CONTRASEÑA ===");

    res.status(200).json({
      message:
        "Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    console.log("=== FIN CAMBIO CONTRASEÑA - ERROR ===");
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta para verificar si un token es válido (para el frontend)
router.get("/verify-reset-token", async (req, res) => {
  console.log("=== VERIFICACIÓN TOKEN RECUPERACIÓN ===");
  console.log("Token recibido:", req.query.token ? "PRESENTE" : "AUSENTE");

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Token requerido" });
    }

    // Buscar el usuario con el token
    const userRows = await query(
      "SELECT id, user, password_reset_expires FROM users WHERE password_reset_token = ?",
      [token]
    );

    if (userRows.length === 0) {
      return res.status(400).json({ valid: false, error: "Token inválido" });
    }

    const user = userRows[0];

    // Verificar si el token ha expirado
    const now = new Date();
    const expirationDate = new Date(user.password_reset_expires);

    if (now > expirationDate) {
      // Limpiar el token expirado
      await query(
        "UPDATE users SET password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?",
        [user.id]
      );
      return res.status(400).json({ valid: false, error: "Token expirado" });
    }

    console.log(`Token válido para usuario ${user.user}`);
    console.log("=== FIN VERIFICACIÓN TOKEN ===");

    res.status(200).json({ valid: true, message: "Token válido" });
  } catch (error) {
    console.error("Error al verificar token:", error);
    console.log("=== FIN VERIFICACIÓN TOKEN - ERROR ===");
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
