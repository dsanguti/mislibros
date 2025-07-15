const mysql = require("mysql2");
require("dotenv").config();

// Crear un pool de conexiones en vez de una sola conexión
const db = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQL_USER || process.env.DB_USER || "root",
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || "mislibros",
  port: process.env.MYSQL_PORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Agregar logging para debug
console.log("Configuración de base de datos:");
console.log(
  "Host:",
  process.env.MYSQL_HOST || process.env.DB_HOST || "localhost"
);
console.log("User:", process.env.MYSQL_USER || process.env.DB_USER || "root");
console.log(
  "Database:",
  process.env.MYSQL_DATABASE || process.env.DB_NAME || "mislibros"
);
console.log("Port:", process.env.MYSQL_PORT || process.env.DB_PORT || 3306);

module.exports = db;
