const db = require("./db");

console.log("🔍 Verificando estructura de la tabla books...");

// Verificar estructura de la tabla
db.query("DESCRIBE books", (err, results) => {
  if (err) {
    console.error("❌ Error al verificar estructura:", err);
    return;
  }

  console.log("📋 Estructura de la tabla books:");
  results.forEach((column) => {
    console.log(
      `  ${column.Field}: ${column.Type} ${
        column.Null === "YES" ? "NULL" : "NOT NULL"
      } ${column.Default !== null ? `DEFAULT ${column.Default}` : ""}`
    );
  });

  // Verificar datos de Star Wars
  console.log("\n🔍 Verificando libros con starwars = 1...");
  db.query(
    "SELECT id, titulo, starwars, comics, user_id FROM books WHERE starwars = 1",
    (err, results) => {
      if (err) {
        console.error("❌ Error al consultar libros Star Wars:", err);
        return;
      }

      console.log(`✅ Libros con starwars = 1: ${results.length}`);
      results.forEach((book) => {
        console.log(
          `  ID: ${book.id}, Título: ${book.titulo}, Star Wars: ${book.starwars}, Comics: ${book.comics}, User ID: ${book.user_id}`
        );
      });

      // Verificar todos los libros
      console.log("\n🔍 Verificando todos los libros...");
      db.query(
        "SELECT id, titulo, starwars, comics, user_id FROM books ORDER BY id DESC LIMIT 10",
        (err, results) => {
          if (err) {
            console.error("❌ Error al consultar todos los libros:", err);
            return;
          }

          console.log(`✅ Últimos 10 libros: ${results.length}`);
          results.forEach((book) => {
            console.log(
              `  ID: ${book.id}, Título: ${book.titulo}, Star Wars: ${book.starwars}, Comics: ${book.comics}, User ID: ${book.user_id}`
            );
          });

          process.exit(0);
        }
      );
    }
  );
});
