const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../../db");
const {
  generateVerificationToken,
  sendVerificationEmail,
} = require("../../services/emailService");
const router = express.Router();

// Ruta para registro público de usuarios (sin autenticación requerida)
router.post("/register", async (req, res) => {
  console.log("=== INICIO REGISTRO PÚBLICO ===");
  console.log("Datos recibidos:", req.body);

  try {
    const { user, password, name, lastname, mail, profile } = req.body;

    // Validar campos requeridos
    if (!user || !password || !name || !lastname || !mail) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios",
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mail)) {
      return res.status(400).json({
        error: "Formato de email inválido",
      });
    }

    // Validar contraseña
    if (password.length < 8) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 8 caracteres",
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await new Promise((resolve, reject) => {
      db.query(
        "SELECT id FROM users WHERE user = ?",
        [user],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    if (existingUser.length > 0) {
      return res.status(400).json({
        error: "El nombre de usuario ya está en uso",
      });
    }

    // Verificar si el email ya existe
    const existingEmail = await new Promise((resolve, reject) => {
      db.query(
        "SELECT id FROM users WHERE mail = ?",
        [mail],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    if (existingEmail.length > 0) {
      return res.status(400).json({
        error: "El email ya está registrado",
      });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generar token de verificación
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Insertar nuevo usuario con verificación por email
    const insertQuery = `
      INSERT INTO users (user, password, name, lastname, mail, profile, verification_token, verification_expires, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)
    `;

    const insertResult = await new Promise((resolve, reject) => {
      db.query(
        insertQuery,
        [
          user,
          hashedPassword,
          name,
          lastname,
          mail,
          profile || "Consulta",
          verificationToken,
          verificationExpires,
        ],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    // Enviar email de verificación
    console.log(`Intentando enviar email de verificación a: ${mail}`);
    const emailSent = await sendVerificationEmail(
      mail,
      verificationToken,
      name
    );

    if (!emailSent) {
      // Si falla el envío del email, eliminar el usuario creado
      console.log("Error al enviar email, eliminando usuario creado");
      await new Promise((resolve, reject) => {
        db.query(
          "DELETE FROM users WHERE id = ?",
          [insertResult.insertId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      return res
        .status(500)
        .json({ error: "Error al enviar el email de verificación" });
    }

    console.log(
      `Usuario ${user} registrado exitosamente. Email de verificación enviado.`
    );
    console.log("=== FIN REGISTRO PÚBLICO ===");

    res.status(201).json({
      message:
        "Usuario registrado correctamente. Revisa tu email para verificar tu cuenta.",
      userId: insertResult.insertId,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    console.log("=== FIN REGISTRO PÚBLICO - ERROR ===");
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

module.exports = router;
