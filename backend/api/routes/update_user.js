const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const db = require("../../db");

// Convertir las funciones de callback a promesas
const query = promisify(db.query).bind(db);

const router = express.Router();

// Ruta para actualizar un usuario (sólo para administradores)
router.put("/update_user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

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

    const { id, user, password, name, lastname, mail, profile } = req.body;

    // Verificar si el usuario a actualizar existe
    const existingUser = await query("SELECT id FROM users WHERE id = ?", [id]);

    if (existingUser.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar si el nuevo username o email ya existe en otro usuario
    const duplicateUser = await query(
      "SELECT id FROM users WHERE (user = ? OR mail = ?) AND id != ?",
      [user, mail, id]
    );

    if (duplicateUser.length > 0) {
      return res.status(400).json({ error: "El usuario o email ya existe" });
    }

    // Preparar la consulta de actualización
    let updateQuery, updateParams;

    if (password && password.trim() !== "") {
      // Si se proporciona una nueva contraseña, la hasheamos
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      updateQuery =
        "UPDATE users SET user = ?, password = ?, name = ?, lastname = ?, mail = ?, profile = ? WHERE id = ?";
      updateParams = [user, hashedPassword, name, lastname, mail, profile, id];
    } else {
      // Si no se proporciona contraseña, no la actualizamos
      updateQuery =
        "UPDATE users SET user = ?, name = ?, lastname = ?, mail = ?, profile = ? WHERE id = ?";
      updateParams = [user, name, lastname, mail, profile, id];
    }

    // Actualizar el usuario
    const result = await query(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
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
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido" });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
