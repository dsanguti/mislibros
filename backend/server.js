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
const apiRoutes = require("./api/routes/routes");
const sagasRoutes = require("./api/routes/sagas");
const librosSagasRoutes = require("./api/routes/librosSagas");
const all_booksRoutes = require("./api/routes/all_books");
const all_usersRoutes = require("./api/routes/all_users"); // Nueva ruta para obtener usuarios
const generosRoutes = require("./api/routes/generos");
const generosEnumRoutes = require("./api/routes/generoEnum");
const librosGeneroRoutes = require("./api/routes/librosGeneros");
const librosStarwarsRoutes = require("./api/routes/librosStarwars");
const comicsRoutes = require("./api/routes/librosComics");
const updateBook = require("./api/routes/updateBook"); // Rutas de actualización de libros
const deleteBook = require("./api/routes/delete_book"); // Rutas de eliminación de libros
const addBook = require("./api/routes/add_book"); // Nueva ruta para añadir libros
const extractMetadata = require("./api/routes/extract_mobi_metadata"); // Ruta para extraer metadatos de PDF y EPUB
const updateSaga = require("./api/routes/update_saga"); // Nueva ruta para actualizar sagas
const createSaga = require("./api/routes/create_saga"); // Nueva ruta para crear sagas
const deleteSaga = require("./api/routes/delete_saga"); // Nueva ruta para eliminar sagas
// Registrar rutas
app.use("/api", loginRoutes);
app.use("/api", apiRoutes);
app.use("/api", sagasRoutes);
app.use("/api", librosSagasRoutes);
app.use("/api", all_booksRoutes);
app.use("/api", all_usersRoutes); // Registrar la ruta para obtener usuarios
app.use("/api", generosRoutes);
app.use("/api", generosEnumRoutes);
app.use("/api", librosGeneroRoutes);
app.use("/api", librosStarwarsRoutes);
app.use("/api", comicsRoutes);
app.use("/api", updateBook); // Ahora updateBook está correctamente registrado en /api/books
app.use("/api", deleteBook); // Registrar la ruta de eliminación de libros
app.use("/api", addBook); // Registrar la nueva ruta para añadir libros
app.use("/api", extractMetadata); // Registrar la ruta para extraer metadatos
app.use("/api", updateSaga); // Registrar la ruta para actualizar sagas
app.use("/api", createSaga); // Registrar la ruta para crear sagas
app.use("/api", deleteSaga); // Registrar la ruta para eliminar sagas

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
