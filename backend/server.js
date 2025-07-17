require("dotenv").config(); // Cargar variables de entorno
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

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

// Middleware para interceptar todas las peticiones
app.use((req, res, next) => {
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
    version: "1.0.1",
  });
});

// Servir archivos estáticos
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Servir imágenes de uploads

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
const downloadBookRoutes = require("./api/routes/download_book");

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
app.use("/api", downloadBookRoutes);

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
