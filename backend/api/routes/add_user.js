const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const db = require("../../db");

// Convertir las funciones de callback a promesas
const query = promisify(db.query).bind(db);

const router = express.Router();

// Ruta para añadir un nuevo usuario (sólo para administradores)
router.post("/add_user", async (req, res) => {
  // Obtener el token de autorización desde los encabezados
  const token = req.headers.authorization?.split(" ")[1]; // Formato: 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario existe y es admin
    const userRows = await query("SELECT profile FROM users WHERE id = ?", [
      decoded.userId,
    ]);

    if (userRows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    if (userRows[0].profile !== "Admin") {
      return res.status(403).json({
        error: "Acceso denegado. Se requieren permisos de administrador.",
      });
    }

    const { user, password, name, lastname, mail, profile } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await query(
      "SELECT id FROM users WHERE user = ? OR mail = ?",
      [user, mail]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "El usuario o email ya existe" });
    }

    // Hashear la contraseña antes de guardarla
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertar el nuevo usuario con la contraseña hasheada
    const result = await query(
      "INSERT INTO users (user, password, name, lastname, mail, profile) VALUES (?, ?, ?, ?, ?, ?)",
      [user, hashedPassword, name, lastname, mail, profile]
    );

    res.status(201).json({
      message: "Usuario creado correctamente",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido" });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
