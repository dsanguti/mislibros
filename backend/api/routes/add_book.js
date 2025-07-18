const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { cloudinary } = require("../../config/cloudinary");

// Asegurar que las carpetas necesarias existan
const ensureDirectoriesExist = () => {
  const directories = [
    path.join(__dirname, "../../uploads/books"),
    path.join(__dirname, "../../images/cover"),
    path.join(__dirname, "../../uploads/temp"),
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directorio creado: ${dir}`);
    }
  });
};

ensureDirectoriesExist();

// Configuración de multer para almacenar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "file") {
      cb(null, path.join(__dirname, "../../uploads/books/"));
    } else if (file.fieldname === "cover") {
      // En desarrollo: usar directorio local, en producción: temporal para Cloudinary
      if (process.env.NODE_ENV === "production") {
        cb(null, path.join(__dirname, "../../uploads/temp/"));
      } else {
        cb(null, path.join(__dirname, "../../images/cover/"));
      }
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
  async (req, res) => {
    try {
      // Verificar token
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
      }

      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
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
        if (!titulo || !autor || !id_genero || !req.files.file) {
          return res.status(400).json({
            error:
              "Faltan campos requeridos: título, autor, género y archivo del libro",
          });
        }

        // Obtener rutas de los archivos
        let filePath = null;
        let coverPath = null;

        if (req.files.file) {
          if (process.env.NODE_ENV === "production") {
            // En producción: subir a Cloudinary
            try {
              console.log("Subiendo archivo de libro a Cloudinary...");
              // Detectar la extensión del archivo original
              const originalFileName = req.files.file[0].originalname;
              const fileExtension = path
                .extname(originalFileName)
                .toLowerCase()
                .substring(1);

              console.log("📁 Archivo original:", originalFileName);
              console.log("📁 Extensión detectada:", fileExtension);

              // Generar un nombre único con la extensión correcta
              const uniqueId =
                Date.now() + "-" + Math.round(Math.random() * 1e9);
              const publicId = `${uniqueId}.${fileExtension || "epub"}`;

              console.log("📁 Public ID generado:", publicId);

              const result = await cloudinary.uploader.upload(
                req.files.file[0].path,
                {
                  folder: "mislibros/books",
                  resource_type: "raw",
                  public_id: publicId,
                  format: fileExtension || "epub",
                }
              );

              filePath = result.secure_url;
              console.log("Archivo subido a Cloudinary:", filePath);

              // Eliminar archivo temporal
              fs.unlinkSync(req.files.file[0].path);
            } catch (uploadError) {
              console.error(
                "Error al subir archivo a Cloudinary:",
                uploadError
              );
              return res
                .status(500)
                .json({ error: "Error al subir el archivo del libro" });
            }
          } else {
            // En desarrollo: usar URL local
            const fileFileName = path.basename(req.files.file[0].path);
            const backendUrl = `http://localhost:${process.env.PORT || 8001}`;
            filePath = `${backendUrl}/uploads/books/${fileFileName}`;

            console.log("Archivo guardado localmente:", filePath);
          }

          console.log("Rutas de archivo:", {
            originalName: req.files.file[0].originalname,
            savedFileName: path.basename(req.files.file[0].path),
            dbPath: filePath,
            physicalPath: req.files.file[0].path,
          });
        }

        if (req.files.cover) {
          console.log("=== DIAGNÓSTICO NODE_ENV ===");
          console.log("NODE_ENV actual:", process.env.NODE_ENV);
          console.log("¿Es producción?", process.env.NODE_ENV === "production");
          console.log(
            "¿Es desarrollo?",
            process.env.NODE_ENV === "development"
          );
          console.log("¿Está definido?", process.env.NODE_ENV ? "SÍ" : "NO");
          console.log("================================================");

          if (process.env.NODE_ENV === "production") {
            // En producción: subir a Cloudinary
            try {
              console.log("Subiendo imagen a Cloudinary...");
              const result = await cloudinary.uploader.upload(
                req.files.cover[0].path,
                {
                  folder: "mislibros/covers",
                  transformation: [
                    { width: 400, height: 600, crop: "fill" },
                    { quality: "auto" },
                  ],
                }
              );

              coverPath = result.secure_url;
              console.log("Imagen subida a Cloudinary:", coverPath);

              // Eliminar archivo temporal
              fs.unlinkSync(req.files.cover[0].path);
            } catch (uploadError) {
              console.error("Error al subir imagen a Cloudinary:", uploadError);
              return res
                .status(500)
                .json({ error: "Error al subir la imagen" });
            }
          } else {
            // En desarrollo: usar URL local
            console.log("Usando almacenamiento local para desarrollo");
            const coverFileName = path.basename(req.files.cover[0].path);
            const backendUrl = `http://localhost:${process.env.PORT || 10000}`;
            coverPath = `${backendUrl}/images/cover/${coverFileName}`;

            console.log("Imagen guardada localmente:", coverPath);
          }

          console.log("=== DEBUG: Almacenamiento de imágenes ===");
          console.log("NODE_ENV:", process.env.NODE_ENV);
          console.log("Cover path final:", coverPath);
          console.log("================================================");

          console.log("Rutas de carátula:", {
            originalName: req.files.cover[0].originalname,
            savedFileName: path.basename(req.files.cover[0].path),
            dbPath: coverPath,
            physicalPath: req.files.cover[0].path,
          });
        }

        console.log("Rutas de archivos:", {
          filePath,
          coverPath,
          fileUrl: filePath,
          coverUrl: coverPath,
        });

        // Convertir valores booleanos
        const isStarWars =
          starwars === "1" || starwars === "true" || starwars === true;
        const isComics = comics === "1" || comics === "true" || comics === true;

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
