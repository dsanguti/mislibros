const express = require("express");
const router = express.Router();
const loginRoutes = require("./login"); // Rutas de login
const verifyEmailRoutes = require("./verify_email"); // Rutas de verificación de email
const verifyToken = require("../../middleware/verifyToken"); // Middleware para verificar el token

// Rutas públicas
router.use("/", loginRoutes); // Las rutas de login están disponibles sin autenticación
router.use("/", verifyEmailRoutes); // Las rutas de verificación de email están disponibles sin autenticación

// Rutas protegidas
router.get("/protected", verifyToken, (req, res) => {
  // Si llegamos aquí, el token fue verificado correctamente
  res.status(200).json({ message: "Acceso permitido", user: req.user });
});

module.exports = router;
