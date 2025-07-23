const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Buffer } = require("buffer");
const pdfParse = require("pdf-parse");
const { fromPath } = require("pdf2pic");

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
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo
  },
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
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            message:
              "El archivo es demasiado grande. El tamaño máximo permitido es 50MB.",
          });
        }
      }
      next(err);
    });
  },
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
        console.log("🚀 Iniciando procesamiento de EPUB en producción...");
        console.log("📁 Archivo:", req.file.originalname);
        console.log("📏 Tamaño:", req.file.size);
        console.log("📍 Ruta:", filePath);

        // Verificar que el archivo existe y tiene contenido
        try {
          const fileStats = fs.statSync(filePath);
          console.log("📊 Estadísticas del archivo:");
          console.log("  - Existe:", fs.existsSync(filePath));
          console.log("  - Tamaño en disco:", fileStats.size);
          console.log("  - Tamaño reportado:", req.file.size);
          console.log("  - ¿Coinciden?:", fileStats.size === req.file.size);

          if (fileStats.size === 0) {
            console.error("❌ ERROR: El archivo está vacío");
            return res.status(400).json({ message: "El archivo está vacío" });
          }

          // Verificar que es un archivo ZIP válido (los EPUBs son ZIPs)
          let fileBuffer = fs.readFileSync(filePath);
          const isZipFile =
            fileBuffer.slice(0, 4).toString("hex") === "504b0304";
          console.log("🔍 ¿Es archivo ZIP válido?:", isZipFile);

          // Log de los primeros bytes para diagnóstico
          console.log(
            "🔍 Primeros 16 bytes:",
            fileBuffer.slice(0, 16).toString("hex")
          );

          if (!isZipFile) {
            console.log(
              "⚠️  Archivo no tiene cabecera ZIP estándar, intentando procesar de todas formas..."
            );

            // Verificar si el archivo se ha corrompido y convertido en JSON (problema común en móvil)
            const firstBytes = fileBuffer.slice(0, 20).toString("utf8");
            if (firstBytes.startsWith("{") || firstBytes.startsWith("[")) {
              console.log(
                "🚨 DETECTADO: Archivo corrompido (JSON) - intentando recuperar..."
              );

              try {
                // Intentar parsear como JSON para ver qué contiene
                const jsonData = JSON.parse(fileBuffer.toString("utf8"));
                console.log(
                  "🔍 Contenido JSON detectado:",
                  Object.keys(jsonData)
                );
                console.log("🔍 Tipo de datos:", typeof jsonData);
                console.log("🔍 ¿Es array?:", Array.isArray(jsonData));
                console.log("🔍 Constructor:", jsonData.constructor.name);
                console.log(
                  "🔍 ¿Tiene length?:",
                  typeof jsonData.length === "number"
                );

                // Verificación más robusta para arrays grandes
                const isArray =
                  Array.isArray(jsonData) ||
                  jsonData.constructor.name === "Array" ||
                  (typeof jsonData.length === "number" && jsonData.length > 0);

                console.log("🔍 ¿Es array (verificación robusta)?:", isArray);

                // Verificar si es un objeto que en realidad contiene datos de array
                // (caso común cuando JSON.parse falla con arrays muy grandes)
                const objectKeys = Object.keys(jsonData);
                const hasNumericKeys = objectKeys.every(
                  (key) => !isNaN(parseInt(key, 10))
                );
                const hasManyKeys = objectKeys.length > 100000;

                console.log("🔍 Claves del objeto:", objectKeys.slice(0, 10));
                console.log(
                  "🔍 ¿Todas las claves son numéricas?:",
                  hasNumericKeys
                );
                console.log("🔍 ¿Tiene muchas claves?:", hasManyKeys);

                if (isArray) {
                  console.log("🔍 Tamaño del array:", jsonData.length);
                  console.log(
                    "🔍 Primeros 10 elementos:",
                    jsonData.slice(0, 10)
                  );
                  console.log(
                    "🔍 Tipo del primer elemento:",
                    typeof jsonData[0]
                  );
                } else if (hasNumericKeys && hasManyKeys) {
                  console.log(
                    "✅ Detectado objeto con claves numéricas (array disfrazado) - recuperando archivo..."
                  );

                  try {
                    // Convertir objeto a array usando las claves numéricas
                    const maxKey = Math.max(
                      ...objectKeys.map((key) => parseInt(key, 10))
                    );
                    const arrayFromObject = new Array(maxKey + 1);

                    for (const key of objectKeys) {
                      const index = parseInt(key, 10);
                      arrayFromObject[index] = jsonData[key];
                    }

                    console.log(
                      "📏 Tamaño del array reconstruido:",
                      arrayFromObject.length
                    );
                    console.log(
                      "🔍 Primeros elementos:",
                      arrayFromObject.slice(0, 10)
                    );

                    // Verificar si los elementos son strings de números
                    const firstElement = arrayFromObject[0];
                    if (
                      typeof firstElement === "string" &&
                      !isNaN(parseInt(firstElement, 10))
                    ) {
                      console.log(
                        "✅ Confirmado: array de strings de números - recuperando archivo..."
                      );

                      // Convertir strings a números y luego a Buffer
                      const numericArray = arrayFromObject.map((item) =>
                        parseInt(item, 10)
                      );
                      const recoveredBuffer = Buffer.from(numericArray);
                      console.log(
                        "📏 Tamaño del archivo recuperado:",
                        recoveredBuffer.length
                      );

                      // Verificar si los datos recuperados son un ZIP válido
                      const isRecoveredZip =
                        recoveredBuffer.slice(0, 4).toString("hex") ===
                        "504b0304";
                      if (isRecoveredZip) {
                        console.log(
                          "✅ Archivo recuperado correctamente - es un ZIP válido"
                        );
                        // Sobrescribir el archivo con los datos recuperados
                        fs.writeFileSync(filePath, recoveredBuffer);
                        console.log("✅ Archivo corregido y guardado");

                        // Actualizar el buffer para el resto del procesamiento
                        fileBuffer = recoveredBuffer;
                      } else {
                        console.log(
                          "❌ Datos recuperados no son un ZIP válido"
                        );
                        console.log(
                          "🔍 Primeros bytes recuperados:",
                          recoveredBuffer.slice(0, 16).toString("hex")
                        );
                      }
                    } else {
                      console.log(
                        "❌ Elementos no son strings de números válidos"
                      );
                    }
                  } catch (reconstructionError) {
                    console.log(
                      "❌ Error al reconstruir array desde objeto:",
                      reconstructionError.message
                    );
                  }
                } else if (Array.isArray(jsonData)) {
                  // Array normal (para casos con menos elementos)
                  console.log(
                    "✅ Detectado array - verificando si son bytes..."
                  );
                  console.log("📊 Tamaño del array:", jsonData.length);
                  console.log("🔍 Primeros elementos:", jsonData.slice(0, 10));

                  // Verificar si los elementos son strings de números
                  const firstElement = jsonData[0];
                  console.log(
                    "🔍 Primer elemento:",
                    firstElement,
                    "tipo:",
                    typeof firstElement
                  );
                  if (
                    typeof firstElement === "string" &&
                    !isNaN(parseInt(firstElement, 10))
                  ) {
                    console.log(
                      "✅ Confirmado: array de strings de números - recuperando archivo..."
                    );

                    try {
                      // Convertir strings a números y luego a Buffer
                      const numericArray = jsonData.map((item) =>
                        parseInt(item, 10)
                      );
                      const recoveredBuffer = Buffer.from(numericArray);
                      console.log(
                        "📏 Tamaño del archivo recuperado:",
                        recoveredBuffer.length
                      );

                      // Verificar si los datos recuperados son un ZIP válido
                      const isRecoveredZip =
                        recoveredBuffer.slice(0, 4).toString("hex") ===
                        "504b0304";
                      if (isRecoveredZip) {
                        console.log(
                          "✅ Archivo recuperado correctamente - es un ZIP válido"
                        );
                        // Sobrescribir el archivo con los datos recuperados
                        fs.writeFileSync(filePath, recoveredBuffer);
                        console.log("✅ Archivo corregido y guardado");

                        // Actualizar el buffer para el resto del procesamiento
                        fileBuffer = recoveredBuffer;
                      } else {
                        console.log(
                          "❌ Datos recuperados no son un ZIP válido"
                        );
                        console.log(
                          "🔍 Primeros bytes recuperados:",
                          recoveredBuffer.slice(0, 16).toString("hex")
                        );
                      }
                    } catch (conversionError) {
                      console.log(
                        "❌ Error al convertir strings a bytes:",
                        conversionError.message
                      );
                    }
                  } else {
                    console.log(
                      "❌ Array no contiene strings de números válidos"
                    );
                  }
                } else {
                  // Buscar datos binarios en el JSON (formato base64)
                  let binaryData = null;
                  for (const [key, value] of Object.entries(jsonData)) {
                    if (typeof value === "string" && value.length > 1000) {
                      // Posiblemente datos binarios codificados
                      try {
                        const decoded = Buffer.from(value, "base64");
                        if (decoded.length > 1000000) {
                          // Más de 1MB
                          binaryData = decoded;
                          console.log(
                            "✅ Datos binarios encontrados en clave:",
                            key
                          );
                          break;
                        }
                      } catch (base64Error) {
                        // No es base64, continuar
                        console.log(
                          "🔍 No es base64 en clave:",
                          key,
                          base64Error.message
                        );
                      }
                    }
                  }

                  if (binaryData) {
                    // Verificar si los datos recuperados son un ZIP válido
                    const isRecoveredZip =
                      binaryData.slice(0, 4).toString("hex") === "504b0304";
                    if (isRecoveredZip) {
                      console.log(
                        "✅ Archivo recuperado correctamente - es un ZIP válido"
                      );
                      // Sobrescribir el archivo con los datos recuperados
                      fs.writeFileSync(filePath, binaryData);
                      console.log("✅ Archivo corregido y guardado");

                      // Actualizar el buffer para el resto del procesamiento
                      fileBuffer = binaryData;
                    } else {
                      console.log("❌ Datos recuperados no son un ZIP válido");
                    }
                  } else {
                    console.log(
                      "❌ No se encontraron datos binarios en el JSON"
                    );
                  }
                }
              } catch (jsonError) {
                console.log("❌ Error al procesar JSON:", jsonError.message);
              }
            }

            // Algunos EPUBs pueden tener cabeceras diferentes o estar ligeramente corruptos
            // pero aún ser procesables por la librería epub
          }
        } catch (fileError) {
          console.error("❌ ERROR al verificar archivo:", fileError);
          return res
            .status(500)
            .json({ message: "Error al verificar el archivo" });
        }

        const epub = require("epub");
        console.log("✅ Librería epub cargada correctamente");
        const book = new epub(filePath);
        console.log("✅ Objeto EPUB creado correctamente");

        return new Promise(() => {
          book.on("end", async () => {
            const metadata = book.metadata;

            const extractedMetadata = {
              title:
                metadata.title || req.file.originalname.replace(".epub", ""),
              author: metadata.creator || "Autor desconocido",
              sinopsis: metadata.description || "Sin descripción disponible",
              cover: null,
            };

            // Extraer portada del EPUB
            console.log("Verificando si el EPUB tiene portada...");

            // Intentar diferentes métodos para obtener la portada
            let coverResource = null;

            // Buscar la portada en el manifest
            if (book.manifest) {
              console.log(
                "🔍 DEBUG: Manifest encontrado con",
                Object.keys(book.manifest).length,
                "elementos"
              );
              const imageResources = [];

              for (const [id, item] of Object.entries(book.manifest)) {
                if (
                  item["media-type"] &&
                  item["media-type"].startsWith("image/")
                ) {
                  imageResources.push({ id, item });
                  console.log(
                    "🔍 DEBUG: Imagen encontrada:",
                    id,
                    "tipo:",
                    item["media-type"]
                  );
                }
              }

              console.log(
                "🔍 DEBUG: Total de imágenes encontradas:",
                imageResources.length
              );

              // Buscar específicamente la portada
              coverResource = null;

              // Prioridad 1: Buscar por ID que contenga "cover"
              for (const { id, item } of imageResources) {
                if (id.toLowerCase().includes("cover")) {
                  coverResource = item;
                  console.log("✅ Portada encontrada por ID 'cover':", id);
                  break;
                }
              }

              // Prioridad 2: Buscar por href que contenga "cover"
              if (!coverResource) {
                for (const { id, item } of imageResources) {
                  if (item.href && item.href.toLowerCase().includes("cover")) {
                    coverResource = item;
                    console.log("✅ Portada encontrada por href 'cover':", id);
                    break;
                  }
                }
              }

              // Prioridad 3: Buscar por propiedades específicas de portada
              if (!coverResource) {
                for (const { id, item } of imageResources) {
                  if (
                    item.properties &&
                    item.properties.includes("cover-image")
                  ) {
                    coverResource = item;
                    console.log(
                      "✅ Portada encontrada por properties 'cover-image':",
                      id
                    );
                    break;
                  }
                }
              }

              // Prioridad 4: Tomar la primera imagen si no se encuentra nada específico
              if (!coverResource && imageResources.length > 0) {
                coverResource = imageResources[0].item;
                console.log(
                  "⚠️ Usando primera imagen como portada:",
                  imageResources[0].id
                );
              }
            }

            if (coverResource) {
              try {
                console.log("✅ Extrayendo portada...");
                console.log("🔍 DEBUG: Cover resource:", coverResource);

                const coverFileName = `cover-${
                  path.parse(req.file.filename).name
                }.jpg`;
                const coverPath = path.join(
                  path.dirname(filePath),
                  coverFileName
                );
                tempFiles.push(coverPath);

                // Intentar diferentes métodos para obtener el contenido de la imagen
                console.log(
                  "🔍 DEBUG: Intentando obtener contenido de la imagen..."
                );

                let imageContent = null;

                // Método 1: Intentar con book.get
                if (book.get) {
                  try {
                    imageContent = book.get(coverResource.id);
                    console.log("✅ Contenido obtenido con book.get");
                  } catch (error) {
                    console.log("❌ Error con book.get:", error.message);
                  }
                }

                // Método 2: Intentar con book.getChapterRaw
                if (!imageContent && book.getChapterRaw) {
                  try {
                    imageContent = book.getChapterRaw(coverResource.href);
                    console.log("✅ Contenido obtenido con book.getChapterRaw");
                  } catch (error) {
                    console.log(
                      "❌ Error con book.getChapterRaw:",
                      error.message
                    );
                  }
                }

                // Método 3: Intentar acceder directamente al recurso
                if (!imageContent && coverResource.data) {
                  imageContent = coverResource.data;
                  console.log("✅ Contenido obtenido directamente del recurso");
                }

                // Método 4: Intentar con book.flow
                if (!imageContent && book.flow) {
                  try {
                    const flowItem = book.flow.find(
                      (item) => item.href === coverResource.href
                    );
                    if (flowItem && flowItem.data) {
                      imageContent = flowItem.data;
                      console.log("✅ Contenido obtenido de book.flow");
                    }
                  } catch (error) {
                    console.log("❌ Error con book.flow:", error.message);
                  }
                }

                // Método 5: Usar book.zip para extraer directamente el archivo
                if (!imageContent && book.zip) {
                  try {
                    console.log("🔍 DEBUG: Intentando extraer con book.zip...");
                    const zip = book.zip;
                    console.log(
                      "🔍 DEBUG: Métodos disponibles en zip:",
                      Object.getOwnPropertyNames(zip)
                    );
                    console.log("🔍 DEBUG: Tipo de zip:", typeof zip);

                    // Usar admZip para extraer la imagen
                    if (zip.admZip) {
                      try {
                        const fileName = coverResource.href;

                        if (zip.names.includes(fileName)) {
                          const zipEntry = zip.admZip.getEntry(fileName);
                          if (zipEntry) {
                            imageContent = zipEntry.getData();
                            console.log("Contenido extraído con admZip");
                          }
                        } else {
                          // Intentar con diferentes variaciones del nombre
                          const variations = [
                            fileName,
                            fileName.replace("OEBPS/", ""),
                            fileName.replace("OEBPS/Images/", "Images/"),
                            fileName.replace("OEBPS/Images/", ""),
                          ];

                          for (const variation of variations) {
                            if (zip.names.includes(variation)) {
                              const zipEntry = zip.admZip.getEntry(variation);
                              if (zipEntry) {
                                imageContent = zipEntry.getData();
                                console.log(
                                  "Contenido extraído con admZip (variación)"
                                );
                                break;
                              }
                            }
                          }
                        }
                      } catch (error) {
                        console.error(
                          "Error al extraer portada:",
                          error.message
                        );
                      }
                    }
                  } catch (error) {
                    console.log("❌ Error con book.zip:", error.message);
                  }
                }

                if (imageContent) {
                  console.log(
                    "🔍 DEBUG: Contenido de imagen obtenido:",
                    typeof imageContent,
                    imageContent ? imageContent.length : "N/A"
                  );

                  if (process.env.NODE_ENV === "production") {
                    // En producción: subir a Cloudinary
                    try {
                      console.log(
                        "🚀 Subiendo portada extraída a Cloudinary..."
                      );
                      const { cloudinary } = require("../../config/cloudinary");

                      // Guardar temporalmente para subir a Cloudinary
                      fs.writeFileSync(coverPath, imageContent);

                      const result = await cloudinary.uploader.upload(
                        coverPath,
                        {
                          folder: "mislibros/covers",
                          transformation: [
                            { width: 400, height: 600, crop: "fill" },
                            { quality: "auto" },
                          ],
                        }
                      );

                      extractedMetadata.cover = result.secure_url;
                      console.log(
                        "✅ Portada subida a Cloudinary:",
                        extractedMetadata.cover
                      );

                      // Eliminar archivo temporal
                      fs.unlinkSync(coverPath);
                    } catch (cloudinaryError) {
                      console.error(
                        "❌ Error al subir portada a Cloudinary:",
                        cloudinaryError
                      );
                      // Fallback: usar ruta local
                      extractedMetadata.cover = `/uploads/temp/${coverFileName}`;
                      console.log(
                        "⚠️ Usando ruta local como fallback:",
                        extractedMetadata.cover
                      );
                    }
                  } else {
                    // En desarrollo: usar archivo local
                    fs.writeFileSync(coverPath, imageContent);
                    extractedMetadata.cover = `/uploads/temp/${coverFileName}`;
                    console.log(
                      "✅ Portada extraída correctamente en:",
                      extractedMetadata.cover
                    );
                  }
                } else {
                  console.log(
                    "❌ No se pudo obtener el contenido de la imagen con ningún método"
                  );
                  console.log(
                    "🔍 DEBUG: Métodos disponibles en book:",
                    Object.getOwnPropertyNames(book)
                  );
                }
              } catch (error) {
                console.error("❌ Error al extraer la portada:", error);
              }
            } else {
              console.log("ℹ️ Este EPUB no tiene portada incluida");
            }

            console.log("Metadatos extraídos:", extractedMetadata);
            res.json(extractedMetadata);
          });

          book.on("error", (error) => {
            console.error("❌ Error al procesar EPUB:", error);
            res
              .status(500)
              .json({ message: "Error al procesar el archivo EPUB" });
          });

          console.log("🔍 DEBUG: Iniciando parse del EPUB...");
          book.parse();
        });
      } else {
        // Para archivos PDF, continuar con el flujo normal
        console.log("Metadatos extraídos:", metadata);
        res.json(metadata);
      }
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
