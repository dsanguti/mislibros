const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { uploadCover } = require("../../config/cloudinary");

// Asegurar que las carpetas necesarias existan (solo para archivos de libros)
const ensureDirectoriesExist = () => {
  const directories = [path.join(__dirname, "../../uploads/books")];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directorio creado: ${dir}`);
    }
  });
};

ensureDirectoriesExist();

// Configuración de multer para almacenar archivos de libros (no imágenes)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Solo para archivos de libros, no para imágenes
    if (file.fieldname === "file") {
      cb(null, path.join(__dirname, "../../uploads/books/"));
    } else {
      cb(new Error("Campo de archivo no válido"), null);
    }
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + "-" + file.originalname;
    cb(null, filename);
  },
});

// Configurar multer para archivos de libros
const uploadBook = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Solo permitir archivos de libros
    if (file.fieldname === "file") {
      const allowedTypes = [
        "application/epub+zip",
        "application/pdf",
        "application/x-mobipocket-ebook",
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Tipo de archivo no permitido para el libro"), false);
      }
    } else {
      cb(new Error("Campo de archivo no válido"), false);
    }
  },
});

// Ruta para añadir un nuevo libro
router.post(
  "/add_book",
  uploadBook.single("file"),
  uploadCover.single("cover"),
  (req, res) => {
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

        // Obtener datos del formulario
        const {
          titulo,
          autor,
          sinopsis,
          id_genero,
          saga_id,
          starwars,
          comics,
        } = req.body;

        console.log("Datos recibidos:", {
          titulo,
          autor,
          sinopsis: sinopsis ? sinopsis.substring(0, 50) + "..." : "",
          id_genero,
          saga_id,
          starwars,
          comics,
          userId,
          files: req.files ? Object.keys(req.files) : "No hay archivos",
        });

        // Validar campos requeridos
        if (!titulo || !autor || !id_genero || !req.file) {
          return res.status(400).json({
            error:
              "Faltan campos requeridos: título, autor, género y archivo del libro",
          });
        }

        // Obtener rutas de los archivos
        let filePath = null;
        let coverPath = null;

        if (req.file) {
          // Obtener el nombre real del archivo guardado
          const fileFileName = path.basename(req.file.path);
          // Crear la URL para la base de datos usando la URL del backend
          const backendUrl =
            process.env.NODE_ENV === "production"
              ? "https://mislibros-production.up.railway.app"
              : `http://localhost:${process.env.PORT || 8001}`;
          filePath = `${backendUrl}/uploads/books/${fileFileName}`;

          console.log("=== DEBUG: Variables de entorno para archivos ===");
          console.log("NODE_ENV:", process.env.NODE_ENV);
          console.log("PORT:", process.env.PORT);
          console.log("Backend URL calculada:", backendUrl);
          console.log("File path final:", filePath);
          console.log("================================================");

          console.log("Rutas de archivo:", {
            originalName: req.file.originalname,
            savedFileName: fileFileName,
            dbPath: filePath,
            physicalPath: req.file.path,
          });
        }

        // Verificar si hay una imagen de carátula (Cloudinary)
        if (req.files && req.files.cover && req.files.cover[0]) {
          // La imagen se subió a Cloudinary, obtener la URL
          coverPath = req.files.cover[0].path; // Cloudinary devuelve la URL en path

          console.log("=== DEBUG: Cloudinary para imágenes ===");
          console.log("Cover path de Cloudinary:", coverPath);
          console.log("================================================");

          console.log("Rutas de carátula:", {
            originalName: req.files.cover[0].originalname,
            cloudinaryUrl: coverPath,
          });
        }

        console.log("Rutas de archivos:", {
          filePath,
          coverPath,
          fileUrl: filePath,
          coverUrl: coverPath,
        });

        // Convertir valores booleanos
        const isStarWars = starwars === "true" || starwars === true;
        const isComics = comics === "true" || comics === true;

        // Convertir saga_id a null si está vacío
        const finalSagaId =
          saga_id && saga_id.trim() !== "" ? Number(saga_id) : null;

        // Insertar libro en la base de datos
        const query = `
        INSERT INTO books (
          titulo, 
          autor, 
          sinopsis, 
          file, 
          cover, 
          starwars, 
          comics, 
          user_id, 
          saga_id, 
          id_genero
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

        const params = [
          titulo,
          autor,
          sinopsis,
          filePath,
          coverPath,
          isStarWars,
          isComics,
          userId,
          finalSagaId,
          Number(id_genero),
        ];

        db.query(query, params, (err, result) => {
          if (err) {
            console.error("Error al añadir el libro:", err);
            return res
              .status(500)
              .json({ error: "Error al añadir el libro: " + err.message });
          }

          res.status(201).json({
            message: "Libro añadido correctamente",
            bookId: result.insertId,
          });
        });
      });
    } catch (error) {
      console.error("Error general al procesar la solicitud:", error);
      res
        .status(500)
        .json({ error: "Error interno del servidor: " + error.message });
    }
  }
);

module.exports = router;
