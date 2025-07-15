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
  console.log("=== INICIO LOGIN ===");
  const { user, password } = req.body;
  console.log("Usuario recibido:", user);
  console.log("Contraseña recibida:", password ? "***SET***" : "NOT SET");

  // Validar que los datos necesarios estén presentes
  if (!user || !password) {
    console.log("Error: Faltan datos de usuario o contraseña");
    return res
      .status(400)
      .json({ error: "Faltan datos de usuario o contraseña" });
  }

  try {
    console.log("Ejecutando consulta SQL para buscar usuario...");
    // Consulta SQL para buscar al usuario por nombre de usuario
    const results = await query("SELECT * FROM users WHERE user = ?", [user]);
    console.log(
      "Resultados de la consulta:",
      results.length,
      "usuarios encontrados"
    );

    if (results.length === 0) {
      console.log("Error: Usuario no encontrado");
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos" });
    }

    const userData = results[0];
    console.log("Usuario encontrado:", {
      id: userData.id,
      user: userData.user,
      name: userData.name,
      is_verified: userData.is_verified,
      profile: userData.profile,
    });

    // Verificar si el usuario está verificado
    if (!userData.is_verified) {
      console.log("Error: Usuario no verificado");
      return res.status(401).json({
        error:
          "Cuenta no verificada. Por favor, verifica tu email antes de iniciar sesión.",
        needsVerification: true,
      });
    }

    // Verificar si la contraseña está hasheada o es texto plano (para compatibilidad)
    let isPasswordValid = false;

    console.log("Verificando contraseña...");
    // Primero verificamos si la contraseña coincide exactamente (texto plano)
    if (password === userData.password) {
      console.log("Contraseña válida (texto plano)");
      isPasswordValid = true;
    } else {
      console.log("Contraseña no coincide en texto plano, probando bcrypt...");
      // Si no coincide en texto plano, intentamos con bcrypt (contraseña hasheada)
      try {
        isPasswordValid = await bcrypt.compare(password, userData.password);
        console.log("Resultado bcrypt:", isPasswordValid);
      } catch (bcryptError) {
        console.error(
          "Error al verificar la contraseña con bcrypt:",
          bcryptError
        );
        isPasswordValid = false;
      }
    }

    if (isPasswordValid) {
      console.log("Contraseña válida, procesando login...");
      // Si la contraseña es correcta pero está en texto plano, la hasheamos
      if (userData.password === password) {
        console.log("Hasheando contraseña en texto plano...");
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Actualizar la contraseña en la base de datos
        await query("UPDATE users SET password = ? WHERE id = ?", [
          hashedPassword,
          userData.id,
        ]);
        console.log("Contraseña hasheada y actualizada");
      }

      // Usuario encontrado, generar un token JWT
      console.log("Generando token JWT...");
      const token = generateToken(userData);

      console.log("Login exitoso, enviando respuesta");
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
      console.log("Error: Contraseña incorrecta");
      res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
  console.log("=== FIN LOGIN ===");
};

module.exports = { login };
