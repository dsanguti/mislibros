const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { promisify } = require("util");
require("dotenv").config(); // Cargar las variables de entorno

// Importar la conexión a la base de datos
const db = require("./db");

// Convertir las funciones de callback a promesas
const query = promisify(db.query).bind(db);

// Función para generar el token JWT
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    user: user.user,
    profile: user.profile, // Incluir el perfil del usuario
  };
  const secretKey = process.env.JWT_SECRET; // Usamos la clave secreta de .env
  const options = { expiresIn: "1h" }; // El token expirará en 1 hora

  return jwt.sign(payload, secretKey, options);
};

// Función de login que incluye la generación del token
const login = async (req, res) => {
  const { user, password } = req.body;

  // Validar que los datos necesarios estén presentes
  if (!user || !password) {
    return res
      .status(400)
      .json({ error: "Faltan datos de usuario o contraseña" });
  }

  try {
    // Consulta SQL para buscar al usuario por nombre de usuario
    const results = await query("SELECT * FROM users WHERE user = ?", [user]);

    if (results.length === 0) {
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos" });
    }

    const userData = results[0];

    // Verificar si el usuario está verificado
    if (!userData.is_verified) {
      return res.status(401).json({
        error:
          "Cuenta no verificada. Por favor, verifica tu email antes de iniciar sesión.",
        needsVerification: true,
      });
    }

    // Verificar si la contraseña está hasheada o es texto plano (para compatibilidad)
    let isPasswordValid = false;

    // Primero verificamos si la contraseña coincide exactamente (texto plano)
    if (password === userData.password) {
      isPasswordValid = true;
    } else {
      // Si no coincide en texto plano, intentamos con bcrypt (contraseña hasheada)
      try {
        isPasswordValid = await bcrypt.compare(password, userData.password);
      } catch (bcryptError) {
        console.error(
          "Error al verificar la contraseña con bcrypt:",
          bcryptError
        );
        isPasswordValid = false;
      }
    }

    if (isPasswordValid) {
      // Si la contraseña es correcta pero está en texto plano, la hasheamos
      if (userData.password === password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Actualizar la contraseña en la base de datos
        await query("UPDATE users SET password = ? WHERE id = ?", [
          hashedPassword,
          userData.id,
        ]);
      }

      // Usuario encontrado, generar un token JWT
      const token = generateToken(userData);

      res.status(200).json({
        message: "Inicio de sesión exitoso",
        user: {
          id: userData.id,
          user: userData.user,
          name: userData.name,
          lastname: userData.lastname,
          mail: userData.mail,
          profile: userData.profile,
          theme: userData.theme || "light", // Incluir el tema del usuario
        },
        token,
      });
    } else {
      // Contraseña incorrecta
      res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = { login };
