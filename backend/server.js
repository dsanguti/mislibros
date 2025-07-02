const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const port = 8001;

// Configuración de las CORS
const corsOptions = {
  origin: "http://localhost:5173", // Origen de tu frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // Se agrega "DELETE"
  credentials: true, // Permitir cookies y credenciales
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

// Configuración de la base de datos
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mislibros",
});

db.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
  } else {
    console.log("Conexión exitosa a la base de datos.");
  }
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

// Middleware para listar todas las rutas registradas
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

// Inicio del servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
