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
  console.log("=== INICIO ACTUALIZACIÓN USUARIO ===");
  console.log(
    "Headers:",
    req.headers.authorization ? "Token presente" : "Token ausente"
  );
  console.log("Body:", req.body);

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decodificado - userId:", decoded.userId);

    // Verificar que el usuario existe
    const userRows = await query("SELECT profile FROM users WHERE id = ?", [
      decoded.userId,
    ]);

    if (userRows.length === 0) {
      console.log("Usuario no encontrado en BD");
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const currentUser = userRows[0];
    console.log("Usuario actual encontrado:", currentUser);
    const { id, user, password, name, lastname, mail, profile } = req.body;

    // Verificar permisos: solo admin puede editar otros usuarios o cambiar perfiles
    console.log("Verificando permisos - perfil actual:", currentUser.profile);
    if (currentUser.profile !== "Admin") {
      console.log("Usuario no es admin, verificando permisos de auto-edición");
      // Si no es admin, solo puede editar su propio perfil
      if (decoded.userId !== parseInt(id)) {
        console.log(
          "Error de permisos - userId:",
          decoded.userId,
          "id:",
          id,
          "tipo id:",
          typeof id
        );
        return res.status(403).json({
          error: "Solo puedes editar tu propio perfil",
        });
      }

      // Si no es admin, no puede cambiar su propio perfil
      if (profile !== currentUser.profile) {
        console.log("Usuario no admin intentando cambiar perfil");
        return res.status(403).json({
          error: "No puedes cambiar tu perfil. Contacta a un administrador.",
        });
      }
    } else {
      console.log("Usuario es admin, puede editar cualquier usuario");
    }

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
    console.log("Ejecutando query de actualización:", updateQuery);
    console.log("Parámetros:", updateParams);

    const result = await query(updateQuery, updateParams);
    console.log("Resultado de la actualización:", result);

    if (result.affectedRows === 0) {
      console.log("No se afectaron filas en la actualización");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    console.log("Usuario actualizado exitosamente");
    const responseData = {
      message: "Usuario actualizado correctamente",
      user: {
        id,
        user,
        name,
        lastname,
        mail,
        profile,
      },
    };
    console.log("Enviando respuesta:", responseData);
    res.json(responseData);
    console.log("Respuesta enviada al frontend");
    console.log("=== FIN ACTUALIZACIÓN USUARIO ===");
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido" });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
