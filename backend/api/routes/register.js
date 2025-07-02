const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../../db");
const router = express.Router();

// Ruta para registro público de usuarios (sin autenticación requerida)
router.post("/register", async (req, res) => {
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

    // Insertar nuevo usuario
    const insertQuery = `
      INSERT INTO users (user, password, name, lastname, mail, profile)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const insertResult = await new Promise((resolve, reject) => {
      db.query(
        insertQuery,
        [user, hashedPassword, name, lastname, mail, profile || "Consulta"],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    res.status(201).json({
      message: "Usuario creado correctamente",
      userId: insertResult.insertId,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

module.exports = router;
