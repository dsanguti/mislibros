const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../../db");
const router = express.Router();

// Configuración de multer para almacenar imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Crear directorio para las carátulas de sagas si no existe
    const dir = path.join(__dirname, "../../images/sagas");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  },
});

// Configurar multer para aceptar solo imágenes
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos de imagen"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // Limitar a 5MB
  },
});

// Ruta para crear una nueva saga
router.post("/create_saga", upload.single("cover"), (req, res) => {
  try {
    // Verificar token
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("Error de verificación de token:", err);
        return res.status(403).json({ error: "Token inválido" });
      }

      const userId = decoded.userId;
      const { nombre } = req.body;
      let coverPath = null;

      // Verificar si se subió una imagen
      if (req.file) {
        // Crear la URL para la base de datos usando la URL del backend
        const backendUrl =
          process.env.RAILWAY_STATIC_URL ||
          `https://${
            process.env.RAILWAY_PROJECT_DOMAIN ||
            "mislibros-production.up.railway.app"
          }`;
        coverPath = `${backendUrl}/images/sagas/${req.file.filename}`;
      }

      // Validar campos requeridos
      if (!nombre) {
        return res.status(400).json({
          error: "El nombre de la saga es obligatorio",
        });
      }

      // Insertar saga en la base de datos
      const query = `
        INSERT INTO sagas (nombre, coverSaga, user_id)
        VALUES (?, ?, ?)
      `;

      const params = [nombre, coverPath, userId];

      db.query(query, params, (err, result) => {
        if (err) {
          console.error("Error al crear la saga:", err);
          return res
            .status(500)
            .json({ error: "Error al crear la saga: " + err.message });
        }

        res.status(201).json({
          message: "Saga creada correctamente",
          sagaId: result.insertId,
        });
      });
    });
  } catch (error) {
    console.error("Error en la ruta create_saga:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
