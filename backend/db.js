const mysql = require("mysql2");
require("dotenv").config();

// Debug: Mostrar todas las variables de entorno relacionadas con MySQL
console.log("=== DEBUG: Variables de entorno MySQL ===");
console.log("MYSQLHOST:", process.env.MYSQLHOST);
console.log("MYSQLUSER:", process.env.MYSQLUSER);
console.log(
  "MYSQLPASSWORD:",
  process.env.MYSQLPASSWORD ? "***SET***" : "NOT SET"
);
console.log("MYSQLDATABASE:", process.env.MYSQLDATABASE);
console.log("MYSQLPORT:", process.env.MYSQLPORT);
console.log("MYSQL_HOST:", process.env.MYSQL_HOST);
console.log("MYSQL_USER:", process.env.MYSQL_USER);
console.log(
  "MYSQL_PASSWORD:",
  process.env.MYSQL_PASSWORD ? "***SET***" : "NOT SET"
);
console.log("MYSQL_DATABASE:", process.env.MYSQL_DATABASE);
console.log("MYSQL_PORT:", process.env.MYSQL_PORT);

// Debug: Mostrar TODAS las variables de entorno disponibles
console.log("=== TODAS LAS VARIABLES DE ENTORNO ===");
Object.keys(process.env).forEach((key) => {
  if (key.includes("MYSQL") || key.includes("DB") || key.includes("DATABASE")) {
    console.log(`${key}:`, process.env[key] ? "***SET***" : "NOT SET");
  }
});
console.log("==========================================");

// Crear un pool de conexiones en vez de una sola conexión
const db = mysql.createPool({
  host:
    process.env.MYSQLHOST ||
    process.env.MYSQL_HOST ||
    process.env.DB_HOST ||
    "localhost",
  user:
    process.env.MYSQLUSER ||
    process.env.MYSQL_USER ||
    process.env.DB_USER ||
    "root",
  password:
    process.env.MYSQLPASSWORD ||
    process.env.MYSQL_PASSWORD ||
    process.env.DB_PASSWORD ||
    "",
  database:
    process.env.MYSQLDATABASE ||
    process.env.MYSQL_DATABASE ||
    process.env.DB_NAME ||
    "mislibros",
  port:
    process.env.MYSQLPORT ||
    process.env.MYSQL_PORT ||
    process.env.DB_PORT ||
    3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Agregar logging para debug
console.log("Configuración final de base de datos:");
console.log(
  "Host:",
  process.env.MYSQLHOST ||
    process.env.MYSQL_HOST ||
    process.env.DB_HOST ||
    "localhost"
);
console.log(
  "User:",
  process.env.MYSQLUSER ||
    process.env.MYSQL_USER ||
    process.env.DB_USER ||
    "root"
);
console.log(
  "Database:",
  process.env.MYSQLDATABASE ||
    process.env.MYSQL_DATABASE ||
    process.env.DB_NAME ||
    "mislibros"
);
console.log(
  "Port:",
  process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT || 3306
);

module.exports = db;
