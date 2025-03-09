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
  methods: ["GET", "POST", "PUT"], // Se agrega "PUT"
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
const apiRoutes = require("./api/routes/routes");
const sagasRoutes = require("./api/routes/sagas");
const librosSagasRoutes = require("./api/routes/librosSagas");
const all_booksRoutes = require("./api/routes/all_books");
const generosRoutes = require("./api/routes/generos");
const generosEnumRoutes = require("./api/routes/generoEnum");
const librosGeneroRoutes = require("./api/routes/librosGeneros");
const librosStarwarsRoutes = require("./api/routes/librosStarwars");
const comicsRoutes = require("./api/routes/librosComics");
const updateBook = require("./api/routes/updateBook"); // Rutas de actualización de libros

// Registrar rutas
app.use("/api", loginRoutes);
app.use("/api", apiRoutes);
app.use("/api", sagasRoutes);
app.use("/api", librosSagasRoutes);
app.use("/api", all_booksRoutes);
app.use("/api", generosRoutes);
app.use("/api", generosEnumRoutes);
app.use("/api", librosGeneroRoutes);
app.use("/api", librosStarwarsRoutes);
app.use("/api", comicsRoutes);
app.use("/api", updateBook); // Ahora updateBook está correctamente registrado en /api/books

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
