require("dotenv").config(); // Cargar variables de entorno
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 8001;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://mislibros.vercel.app",
  "https://mislibros-git-main-dsanguti.vercel.app",
  "https://mislibros-dsanguti.vercel.app",
];
console.log("Allowed origins:", allowedOrigins);
const corsOptions = {
  origin: function (origin, callback) {
    console.log("CORS - Origin recibido:", origin);
    // Permitir peticiones sin origin (como Postman o curl)
    if (!origin || allowedOrigins.includes(origin)) {
      console.log("CORS - Origin permitido:", origin);
      callback(null, true);
    } else {
      console.log("CORS - Origin bloqueado:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

// Middleware para interceptar todas las peticiones (excepto descarga de libros)
app.use((req, res, next) => {
  // No interceptar peticiones de descarga de libros para evitar conflictos
  if (req.url.startsWith("/api/download-book/")) {
    return next();
  }

  console.log(`=== PETICIÓN RECIBIDA ===`);
  console.log(`Método: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Body:`, req.body);
  console.log(`Headers:`, req.headers);
  console.log(`=======================`);
  next();
});

// Importar la conexión a la base de datos desde db.js
require("./db");

// Endpoint de salud
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
    version: "1.0.2",
  });
});

// Servir archivos estáticos
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Servir imágenes de uploads

// Endpoint para actualizar URLs de archivos a Cloudinary
app.post("/api/update-file-urls", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const jwt = require("jsonwebtoken");
  const db = require("./db");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }

    // Solo administradores pueden ejecutar esta acción
    if (decoded.profile !== "Admin") {
      return res
        .status(403)
        .json({ error: "Solo administradores pueden ejecutar esta acción" });
    }

    // Obtener todos los libros con URLs locales
    const query =
      "SELECT id, file, titulo FROM books WHERE file LIKE '%localhost%' OR file LIKE '%railway%'";

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error al consultar libros:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }

      console.log(`Encontrados ${results.length} libros con URLs locales`);

      // Por ahora, solo devolver la información
      res.json({
        message: "Libros encontrados con URLs locales",
        count: results.length,
        books: results.map((book) => ({
          id: book.id,
          titulo: book.titulo,
          currentUrl: book.file,
        })),
      });
    });
  });
});

// Endpoint de descarga de libros (directo en server.js para asegurar funcionamiento)
app.get("/api/download-book/:bookId", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const bookId = req.params.bookId;

  console.log("=== DOWNLOAD BOOK REQUEST (DIRECT) ===");
  console.log("Book ID:", bookId);
  console.log("Token present:", !!token);
  console.log("Full URL:", req.url);
  console.log("Method:", req.method);
  console.log("Headers:", req.headers);

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const jwt = require("jsonwebtoken");
  const db = require("./db");
  const path = require("path");
  const fs = require("fs");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(403).json({ error: "Token inválido" });
    }

    const userId = decoded.userId;
    console.log("User ID from token:", userId);

    // Verificar que el libro pertenece al usuario
    const query = "SELECT file, titulo FROM books WHERE id = ? AND user_id = ?";

    db.query(query, [bookId, userId], (err, results) => {
      if (err) {
        console.error("Error al consultar el libro:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }

      console.log("Query results:", results);

      if (results.length === 0) {
        return res.status(404).json({ error: "Libro no encontrado" });
      }

      const book = results[0];

      if (!book.file) {
        return res.status(404).json({ error: "Archivo no disponible" });
      }

      // Verificar si es un archivo de Cloudinary o local
      if (book.file.includes("cloudinary.com")) {
        // Es un archivo de Cloudinary, usar la API para descargarlo
        console.log("Archivo de Cloudinary, usando API para descargar...");

        // Detectar la extensión correcta del archivo
        const getFileExtension = (fileUrl) => {
          if (!fileUrl) return ".epub"; // extensión por defecto

          // Extraer la extensión de la URL del archivo
          const urlParts = fileUrl.split(".");
          const extension = urlParts[urlParts.length - 1]?.toLowerCase();

          // Validar que sea una extensión válida
          if (
            extension === "pdf" ||
            extension === "epub" ||
            extension === "mobi"
          ) {
            return `.${extension}`;
          }

          return ".epub"; // extensión por defecto si no se puede detectar
        };

        const fileExtension = getFileExtension(book.file);
        console.log("📁 Extensión detectada para Cloudinary:", fileExtension);

        // Extraer el public_id de la URL de Cloudinary
        const extractPublicId = (cloudinaryUrl) => {
          try {
            console.log(
              "🔍 URL original para extraer public_id:",
              cloudinaryUrl
            );

            // Ejemplo: https://res.cloudinary.com/do8zbut6y/raw/upload/v1752845688/mislibros/books/1752845687045-40336885.pdf
            const urlParts = cloudinaryUrl.split("/");
            console.log("🔍 URL parts:", urlParts);

            const uploadIndex = urlParts.indexOf("upload");
            console.log("🔍 Upload index:", uploadIndex);

            if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
              // Tomar todo después de 'upload' excepto la versión
              const partsAfterUpload = urlParts.slice(uploadIndex + 2);
              console.log("🔍 Parts after upload:", partsAfterUpload);

              // Remover la versión (v1752845688) si existe
              const withoutVersion = partsAfterUpload.filter(
                (part) => !part.startsWith("v")
              );
              console.log("🔍 Parts without version:", withoutVersion);

              const publicId = withoutVersion
                .join("/")
                .replace(/\.[^/.]+$/, ""); // Remover extensión
              console.log("🔍 Public ID final:", publicId);

              return publicId;
            }
            return null;
          } catch (error) {
            console.error("Error extrayendo public_id:", error);
            return null;
          }
        };

        const publicId = extractPublicId(book.file);
        console.log("🔍 Public ID extraído:", publicId);

        if (!publicId) {
          console.error("❌ No se pudo extraer el public_id de la URL");
          return res.status(500).json({ error: "URL de Cloudinary inválida" });
        }

        // Usar la API de Cloudinary para generar una URL de descarga firmada
        const cloudinary = require("cloudinary").v2;

        // Configurar Cloudinary con las credenciales
        console.log("🔧 Configurando Cloudinary...");
        console.log("🔧 Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
        console.log(
          "🔧 API key:",
          process.env.CLOUDINARY_API_KEY ? "Presente" : "Faltante"
        );
        console.log(
          "🔧 API secret:",
          process.env.CLOUDINARY_API_SECRET ? "Presente" : "Faltante"
        );

        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        try {
          // Generar una URL firmada para descarga
          const signedUrl = cloudinary.url(publicId, {
            resource_type: "raw",
            sign_url: true,
            type: "upload",
            flags: "attachment",
          });

          console.log("🔗 URL firmada generada:", signedUrl);

          // Descargar usando la URL firmada
          fetch(signedUrl)
            .then((response) => {
              console.log(
                "📡 Respuesta de Cloudinary (firmada) - Status:",
                response.status
              );

              if (!response.ok) {
                console.error(
                  "❌ Error en respuesta de Cloudinary (firmada):",
                  response.status,
                  response.statusText
                );
                throw new Error(
                  `HTTP error! status: ${response.status} - ${response.statusText}`
                );
              }
              return response.arrayBuffer();
            })
            .then((buffer) => {
              console.log(
                "📦 Buffer recibido (firmada), tamaño:",
                buffer.byteLength
              );

              // Configurar headers para la descarga
              res.setHeader("Content-Type", "application/octet-stream");
              res.setHeader(
                "Content-Disposition",
                `attachment; filename="${encodeURIComponent(
                  book.titulo
                )}${fileExtension}"`
              );

              // Enviar el archivo
              res.send(new Uint8Array(buffer));
              console.log(
                "✅ Archivo de Cloudinary enviado correctamente (URL firmada)"
              );
            })
            .catch((error) => {
              console.error(
                "❌ Error al descargar archivo de Cloudinary (firmada):",
                error
              );

              // Si falla la URL firmada, intentar con la URL original pero modificada
              console.log("🔄 Intentando con URL original modificada...");

              // Crear una URL que fuerce la descarga
              const downloadUrl = book.file.replace(
                "/raw/upload/",
                "/upload/fl_attachment/"
              );
              console.log("🔗 URL de descarga alternativa:", downloadUrl);

              fetch(downloadUrl)
                .then((response) => {
                  console.log(
                    "📡 Respuesta de Cloudinary (alternativa) - Status:",
                    response.status
                  );

                  if (!response.ok) {
                    throw new Error(
                      `HTTP error! status: ${response.status} - ${response.statusText}`
                    );
                  }
                  return response.arrayBuffer();
                })
                .then((buffer) => {
                  console.log(
                    "📦 Buffer recibido (alternativa), tamaño:",
                    buffer.byteLength
                  );

                  // Configurar headers para la descarga
                  res.setHeader("Content-Type", "application/octet-stream");
                  res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="${encodeURIComponent(
                      book.titulo
                    )}${fileExtension}"`
                  );

                  // Enviar el archivo
                  res.send(new Uint8Array(buffer));
                  console.log(
                    "✅ Archivo de Cloudinary enviado correctamente (URL alternativa)"
                  );
                })
                .catch((retryError) => {
                  console.error(
                    "❌ Error también con URL alternativa:",
                    retryError
                  );
                  res.status(500).json({
                    error: "Error al descargar el archivo de Cloudinary",
                    details: error.message,
                  });
                });
            });
        } catch (cloudinaryError) {
          console.error("❌ Error configurando Cloudinary:", cloudinaryError);
          res.status(500).json({
            error: "Error configurando Cloudinary",
            details: cloudinaryError.message,
          });
        }
      } else {
        // Es un archivo local
        const fileName = path.basename(book.file);
        const filePath = path.join(__dirname, "uploads/books", fileName);

        console.log("File path:", filePath);
        console.log("File exists:", fs.existsSync(filePath));

        // Verificar que el archivo existe
        if (!fs.existsSync(filePath)) {
          console.error("Archivo no encontrado:", filePath);
          return res
            .status(404)
            .json({ error: "Archivo no encontrado en el servidor" });
        }

        // Detectar la extensión correcta del archivo
        const getFileExtension = (fileUrl) => {
          if (!fileUrl) return ".epub"; // extensión por defecto

          // Extraer la extensión de la URL del archivo
          const urlParts = fileUrl.split(".");
          const extension = urlParts[urlParts.length - 1]?.toLowerCase();

          // Validar que sea una extensión válida
          if (
            extension === "pdf" ||
            extension === "epub" ||
            extension === "mobi"
          ) {
            return `.${extension}`;
          }

          return ".epub"; // extensión por defecto si no se puede detectar
        };

        const fileExtension = getFileExtension(book.file);

        // Configurar headers para la descarga
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${encodeURIComponent(
            book.titulo
          )}${fileExtension}"`
        );

        // Enviar el archivo
        res.sendFile(filePath, (err) => {
          if (err) {
            console.error("Error al enviar archivo:", err);
            if (!res.headersSent) {
              res.status(500).json({ error: "Error al enviar el archivo" });
            }
          } else {
            console.log("Archivo enviado correctamente");
          }
        });
      }
    });
  });
});

// Rutas
const loginRoutes = require("./api/routes/login");
const registerRoutes = require("./api/routes/register");
const sagasRoutes = require("./api/routes/sagas");
const librosSagasRoutes = require("./api/routes/librosSagas");
const allBooksRoutes = require("./api/routes/all_books");
const allUsersRoutes = require("./api/routes/all_users");
const generosRoutes = require("./api/routes/generos");
const generoEnumRoutes = require("./api/routes/generoEnum");
const librosGeneroRoutes = require("./api/routes/librosGeneros");
const librosStarwarsRoutes = require("./api/routes/librosStarwars");
const librosComicsRoutes = require("./api/routes/librosComics");
const updateBookRoutes = require("./api/routes/updateBook");
const deleteBookRoutes = require("./api/routes/delete_book");
const addBookRoutes = require("./api/routes/add_book");
const extractMetadataRoutes = require("./api/routes/extract_mobi_metadata");
const updateSagaRoutes = require("./api/routes/update_saga");
const createSagaRoutes = require("./api/routes/create_saga");
const deleteSagaRoutes = require("./api/routes/delete_saga");
const updateUserRoutes = require("./api/routes/update_user");
const deleteUserRoutes = require("./api/routes/delete_user");
const addUserRoutes = require("./api/routes/add_user");
const verifyEmailRoutes = require("./api/routes/verify_email");
const forgotPasswordRoutes = require("./api/routes/forgot_password");
const resetPasswordRoutes = require("./api/routes/reset_password");

// Registrar rutas
app.use("/api", loginRoutes);
app.use("/api", registerRoutes);
app.use("/api", sagasRoutes);
app.use("/api", librosSagasRoutes);
app.use("/api", allBooksRoutes);
app.use("/api", allUsersRoutes);
app.use("/api", generosRoutes);
app.use("/api", generoEnumRoutes);
app.use("/api", librosGeneroRoutes);
app.use("/api", librosStarwarsRoutes);
app.use("/api", librosComicsRoutes);
app.use("/api", updateBookRoutes);
app.use("/api", deleteBookRoutes);
app.use("/api", addBookRoutes);
app.use("/api", extractMetadataRoutes);
app.use("/api", updateSagaRoutes);
app.use("/api", createSagaRoutes);
app.use("/api", deleteSagaRoutes);
app.use("/api", updateUserRoutes);
app.use("/api", deleteUserRoutes);
app.use("/api", addUserRoutes);
app.use("/api", verifyEmailRoutes);
app.use("/api", forgotPasswordRoutes);
app.use("/api", resetPasswordRoutes);

// Inicio del servidor
const server = app
  .listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);

    // Middleware para listar todas las rutas registradas
    try {
      app._router.stack.forEach((middleware) => {
        if (middleware.route) {
          console.log(`Ruta registrada: ${middleware.route.path}`);
        } else if (middleware.name === "router") {
          middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
              console.log(`Ruta registrada: ${handler.route.path}`);
            }
          });
        }
      });
    } catch (error) {
      console.log("No se pudieron listar las rutas:", error.message);
    }
  })
  .on("error", (err) => {
    console.error("Error al iniciar el servidor:", err);
    process.exit(1);
  });

// Manejo de señales de terminación
process.on("SIGTERM", () => {
  console.log("SIGTERM recibido, cerrando servidor...");
  server.close(() => {
    console.log("Servidor cerrado");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT recibido, cerrando servidor...");
  server.close(() => {
    console.log("Servidor cerrado");
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on("uncaughtException", (err) => {
  console.error("Error no capturado:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Promesa rechazada no manejada:", reason);
  process.exit(1);
});
