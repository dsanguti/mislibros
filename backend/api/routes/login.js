const express = require("express");
const router = express.Router();
const { login } = require("../../auth"); // Importar la función de login desde auth.js

// Definimos la ruta de login
router.post("/login", login); // Usamos la función login que ya está definida en auth.js

module.exports = router;

