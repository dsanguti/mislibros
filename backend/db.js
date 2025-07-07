const mysql = require("mysql2");

// Crear la conexión a la base de datos
const db = mysql.createConnection({
  host: "localhost", // Cambia si no estás usando localhost
  user: "root", // Usuario de tu base de datos
  password: "", // Contraseña de tu base de datos
  database: "mislibros", // Nombre de tu base de datos
});

// Función para agregar campos de verificación a la tabla users
const addVerificationFields = () => {
  const alterTableQuery = `
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS verification_expires DATETIME NULL
  `;

  db.query(alterTableQuery, (err) => {
    if (err) {
      console.error("Error al agregar campos de verificación:", err);
    } else {
      console.log("Campos de verificación agregados correctamente");
    }
  });
};

// Función para agregar campos de recuperación de contraseña
const addPasswordResetFields = () => {
  const alterTableQuery = `
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS password_reset_expires DATETIME NULL
  `;

  db.query(alterTableQuery, (err) => {
    if (err) {
      console.error(
        "Error al agregar campos de recuperación de contraseña:",
        err
      );
    } else {
      console.log(
        "Campos de recuperación de contraseña agregados correctamente"
      );
    }
  });
};

// Ejecutar las funciones cuando se conecte a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
    return;
  }
  console.log("Conectado a la base de datos MySQL");
  addVerificationFields();
  addPasswordResetFields();
});

module.exports = db;
