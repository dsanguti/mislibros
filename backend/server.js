const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path"); // Importar path
const app = express();

const port = 8001;

// Configuración de las Cors
const corsOptions = {
  origin: "http://localhost:5173", // Origen de tu frontend
  methods: ["GET", "POST"],
  credentials: true, // Permitir cookies y credenciales
};

app.use(cors(corsOptions));
// Middleware

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

// Servir archivos estáticos desde la carpeta "images"
app.use("/images", express.static(path.join(__dirname, "images")));

// Rutas
const loginRoutes = require("./api/routes/login");
const apiRoutes = require("./api/routes/routes"); // Importar rutas protegidas
const sagasRoutes = require("./api/routes/sagas");
const librosSagasRoutes = require("./api/routes/librosSagas"); // Importar el nuevo router

app.use("/api", loginRoutes); // Rutas de autenticación
app.use("/api", apiRoutes); // Rutas protegidas
app.use("/api", sagasRoutes); // Rutas sagas
app.use("/api", librosSagasRoutes); // Rutas libros de sagas

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