const mysql = require('mysql2');

// Crear la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost', // Cambia si no estás usando localhost
  user: 'root',      // Usuario de tu base de datos
  password: '',      // Contraseña de tu base de datos
  database: 'mislibros', // Nombre de tu base de datos
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    throw err;
  }
  console.log('Conexión exitosa a la base de datos.');
});

module.exports = db;
