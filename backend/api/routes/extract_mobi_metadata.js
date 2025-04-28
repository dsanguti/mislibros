const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { fromPath } = require("pdf2pic");
const { Buffer } = require("buffer");
const router = express.Router();

// Asegurar que el directorio temporal existe
const ensureTempDirectoryExists = () => {
  const tempDir = path.join(__dirname, "../../uploads/temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

// Función para limpiar archivos temporales
const cleanupFiles = (files) => {
  files.forEach((file) => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`Archivo temporal eliminado: ${file}`);
      }
    } catch (error) {
      console.error(`Error al eliminar archivo temporal ${file}:`, error);
    }
  });
};

// Configurar multer para el manejo de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = ensureTempDirectoryExists();
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/epub+zip" ||
      file.originalname.toLowerCase().endsWith(".pdf") ||
      file.originalname.toLowerCase().endsWith(".epub")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF y EPUB"), false);
    }
  },
});

// Middleware para verificar el token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }
  next();
};

// Ruta para extraer metadatos de archivos PDF y EPUB
router.post(
  "/extract_metadata",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    const tempFiles = [];
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No se ha proporcionado ningún archivo" });
      }

      console.log("Archivo recibido:", {
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });

      const filePath = req.file.path;
      tempFiles.push(filePath);

      let metadata = {
        title: "",
        author: "",
        sinopsis: "",
        cover: null,
      };

      // Procesar según el tipo de archivo
      if (req.file.mimetype === "application/pdf") {
        // Procesar PDF
        console.log("Leyendo archivo PDF...");
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);

        // Extraer título y autor del nombre del archivo
        const fileName = req.file.originalname.replace(".pdf", "");
        const [title, author] = fileName
          .split(" - ")
          .map((part) => part.trim());

        // Extraer una mejor sinopsis del contenido
        let sinopsis = "";
        if (data.text) {
          // Limpiar el texto y obtener las primeras líneas significativas
          const lines = data.text
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && !line.match(/^[0-9]+$/));

          // Tomar las primeras 10 líneas no vacías
          sinopsis = lines.slice(0, 10).join("\n");

          // Si la sinopsis es muy corta, intentar obtener más contenido
          if (sinopsis.length < 100) {
            sinopsis = lines.slice(0, 20).join("\n");
          }
        }

        metadata = {
          title: title || req.file.originalname.replace(".pdf", ""),
          author: author || "Autor desconocido",
          sinopsis: sinopsis || "Sin descripción disponible",
          cover: null,
        };

        // Intentar extraer la primera página como portada
        try {
          console.log("Generando portada desde la primera página...");
          const coverFileName = `cover-${
            path.parse(req.file.filename).name
          }.jpg`;
          const coverPath = path.join(path.dirname(filePath), coverFileName);
          tempFiles.push(coverPath);

          // Configurar las opciones de conversión
          const options = {
            density: 300,
            saveFilename: path.parse(coverFileName).name,
            savePath: path.dirname(coverPath),
            format: "jpg",
            width: 800,
            height: 1200,
            preserveAspectRatio: true,
          };

          console.log("Opciones de conversión:", options);
          console.log("Ruta del archivo PDF:", filePath);
          console.log("Ruta de destino de la portada:", coverPath);

          // Convertir la primera página a imagen
          const convert = fromPath(filePath, options);
          console.log("Iniciando conversión...");
          const result = await convert(1);
          console.log("Resultado de la conversión:", result);

          // Verificar que el archivo se haya creado
          const actualCoverPath = result.path;
          if (fs.existsSync(actualCoverPath)) {
            console.log("Archivo de portada creado en:", actualCoverPath);
            // Obtener el nombre del archivo sin la ruta completa
            const actualCoverFileName = path.basename(actualCoverPath);
            metadata.cover = `/uploads/temp/${actualCoverFileName}`;
            console.log("Portada extraída correctamente en:", metadata.cover);
          } else {
            console.error(
              "El archivo de portada no se creó en:",
              actualCoverPath
            );
            // Intentar listar los archivos en el directorio
            const files = fs.readdirSync(path.dirname(coverPath));
            console.log("Archivos en el directorio:", files);
          }
        } catch (error) {
          console.error("Error al generar la portada:", error);
          console.error("Stack trace:", error.stack);
        }
      } else if (req.file.mimetype === "application/epub+zip") {
        // Procesar EPUB
        console.log("Leyendo archivo EPUB...");
        const epubjs = require("epubjs");
        const book = new epubjs.Book(filePath);
        await book.ready;

        const bookMetadata = await book.metadata;
        metadata = {
          title:
            bookMetadata.title || req.file.originalname.replace(".epub", ""),
          author: bookMetadata.creator || "Autor desconocido",
          sinopsis: bookMetadata.description || "Sin descripción disponible",
          cover: null,
        };

        // Extraer portada del EPUB
        try {
          console.log("Buscando portada...");
          const cover = await book.coverUrl();
          if (cover) {
            console.log("Portada encontrada, extrayendo...");
            const coverFileName = `cover-${
              path.parse(req.file.filename).name
            }.jpg`;
            const coverPath = path.join(path.dirname(filePath), coverFileName);
            tempFiles.push(coverPath);

            const response = await fetch(cover);
            const coverBuffer = await response.arrayBuffer();
            fs.writeFileSync(coverPath, Buffer.from(coverBuffer));
            metadata.cover = `/uploads/temp/${coverFileName}`;
            console.log("Portada extraída correctamente");
          }
        } catch (error) {
          console.error("Error al extraer la portada:", error);
        }
      }

      console.log("Metadatos extraídos:", metadata);
      res.json(metadata);
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      res.status(500).json({ message: "Error al procesar el archivo" });
    } finally {
      // Limpiar archivos temporales después de un tiempo
      setTimeout(() => {
        cleanupFiles(tempFiles);
      }, 300000); // 5 minutos
    }
  }
);

// Ruta para limpiar archivos temporales
router.delete("/cleanup", (req, res) => {
  try {
    const tempDir = path.join(__dirname, "../../uploads/temp");
    const files = fs.readdirSync(tempDir);

    files.forEach((file) => {
      const filePath = path.join(tempDir, file);
      fs.unlinkSync(filePath);
    });

    res.json({ message: "Archivos temporales limpiados correctamente" });
  } catch (error) {
    console.error("Error al limpiar archivos temporales:", error);
    res.status(500).json({ error: "Error al limpiar archivos temporales" });
  }
});

module.exports = router;
