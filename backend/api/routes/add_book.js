const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const router = express.Router();

// Configuración de multer para almacenar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determinar la carpeta según el tipo de archivo
    if (file.fieldname === "file") {
      cb(null, "uploads/books/");
    } else if (file.fieldname === "cover") {
      cb(null, "uploads/covers/");
    }
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
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
        "application/x-mobipocket-ebook"
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
  }
});

// Ruta para añadir un nuevo libro
router.post("/add_book", upload.fields([
  { name: "file", maxCount: 1 },
  { name: "cover", maxCount: 1 }
]), (req, res) => {
  // Verificar token
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
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
      comics
    } = req.body;

    // Validar campos requeridos
    if (!titulo || !autor || !id_genero || !req.files.file) {
      return res.status(400).json({ 
        error: "Faltan campos requeridos: título, autor, género y archivo del libro" 
      });
    }

    // Obtener rutas de los archivos
    const filePath = req.files.file[0].path;
    const coverPath = req.files.cover ? req.files.cover[0].path : null;

    // Convertir valores booleanos
    const isStarWars = starwars === "true" || starwars === true;
    const isComics = comics === "true" || comics === true;

    // Convertir saga_id a null si está vacío
    const finalSagaId = saga_id && saga_id.trim() !== "" ? Number(saga_id) : null;

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
      Number(id_genero)
    ];

    db.query(query, params, (err, result) => {
      if (err) {
        console.error("Error al añadir el libro:", err);
        return res.status(500).json({ error: "Error al añadir el libro" });
      }

      res.status(201).json({
        message: "Libro añadido correctamente",
        bookId: result.insertId
      });
    });
  });
});

module.exports = router;