const jwt = require("jsonwebtoken");
require("dotenv").config(); // Cargar las variables de entorno

// Importar la conexión a la base de datos
const db = require("./db"); // Asegúrate de que la ruta sea correcta

// Función para generar el token JWT
const generateToken = (user) => {
  const payload = {
    id: user.id,
    user: user.user,
    profile: user.profile, // Incluir el perfil del usuario
  };
  const secretKey = process.env.JWT_SECRET; // Usamos la clave secreta de .env
  const options = { expiresIn: "1h" }; // El token expirará en 1 hora

  return jwt.sign(payload, secretKey, options);
};

// Función de login que incluye la generación del token
const login = (req, res) => {
  const { user, password } = req.body;

  // Validar que los datos necesarios estén presentes
  if (!user || !password) {
    return res
      .status(400)
      .json({ error: "Faltan datos de usuario o contraseña" });
  }

  // Consulta SQL para buscar al usuario
  const query = "SELECT * FROM users WHERE user = ? AND password = ?";

  // Ejecutar la consulta
  db.query(query, [user, password], (err, results) => {
    if (err) {
      console.error("Error al consultar la base de datos:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (results.length > 0) {
      // Usuario encontrado, generar un token JWT
      const token = generateToken(results[0]);
      res.status(200).json({
        message: "Inicio de sesión exitoso",
        user: results[0],
        token, // Enviar el token al cliente
      });
    } else {
      // Usuario no encontrado
      res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }
  });
};

module.exports = { login };
