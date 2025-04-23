const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Asegurar que las carpetas necesarias existan
const ensureDirectoriesExist = () => {
  const directories = [
    path.join(__dirname, "../../uploads/books"),
    path.join(__dirname, "../../images/cover"),
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directorio creado: ${dir}`);
    }
  });
};

// Llamar a la función al iniciar el módulo
ensureDirectoriesExist();

// Configuración de multer para almacenar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determinar la carpeta según el tipo de archivo
    if (file.fieldname === "file") {
      cb(null, path.join(__dirname, "../../uploads/books/"));
    } else if (file.fieldname === "cover") {
      cb(null, path.join(__dirname, "../../images/cover/"));
    }
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + "-" + file.originalname;

    // Guardar el nombre generado en el objeto req para usarlo después
    if (file.fieldname === "cover") {
      req.generatedCoverName = filename;
    }

    cb(null, filename);
  },
});

// Configurar multer para aceptar múltiples archivos
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivo permitidos
    if (file.fieldname === "file") {
      // Permitir EPUB, PDF y MOBI
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
    } else if (file.fieldname === "cover") {
      // Permitir imágenes
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Tipo de archivo no permitido para la portada"), false);
      }
    }
  },
});

// Ruta para añadir un nuevo libro
router.post(
  "/add_book",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
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

        const userId = decoded.id;

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
        if (!titulo || !autor || !id_genero || !req.files.file) {
          return res.status(400).json({
            error:
              "Faltan campos requeridos: título, autor, género y archivo del libro",
          });
        }

        // Obtener rutas de los archivos
        const filePath = req.files.file[0].path;
        let coverPath = null;

        if (req.files.cover) {
          // Obtener el nombre real del archivo guardado
          const coverFileName = path.basename(req.files.cover[0].path);
          // Crear la URL para la base de datos
          coverPath = `http://localhost:8001/images/cover/${coverFileName}`;

          console.log("Rutas de carátula:", {
            originalName: req.files.cover[0].originalname,
            savedFileName: coverFileName,
            dbPath: coverPath,
            physicalPath: req.files.cover[0].path,
          });
        }

        console.log("Rutas de archivos:", {
          filePath,
          coverPath,
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
