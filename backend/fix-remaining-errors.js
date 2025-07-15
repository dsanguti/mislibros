const fs = require("fs");
const path = require("path");

// Directorio de rutas
const routesDir = path.join(__dirname, "api", "routes");

// Función para corregir un archivo
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let hasChanges = false;

    // Corregir errores específicos que hemos visto
    const originalContent = content;

    // Corregir operadores ternarios mal formados
    content = content.replace(/(\w+)\s+\$(\d+)\s+(\w+)/g, "$1 ? $3");

    // Corregir saga_id.trim() mal formado
    content = content.replace(
      /saga_id\.trim\(\) !== "" \$(\d+) Number\(saga_id\)/g,
      'saga_id.trim() !== "" ? Number(saga_id)'
    );

    // Corregir otros patrones similares
    content = content.replace(/(\w+)\s+\$(\d+)\s+(\w+\([^)]*\))/g, "$1 ? $3");

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Corregido: ${path.basename(filePath)}`);
      hasChanges = true;
    }

    return hasChanges;
  } catch (error) {
    console.error(`❌ Error corrigiendo ${filePath}:`, error.message);
    return false;
  }
}

// Función para buscar errores en un archivo
function findErrors(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      if (line.includes("$") && (line.includes("?") || line.includes(":"))) {
        console.log(
          `⚠️  Posible error en ${path.basename(filePath)}:${
            index + 1
          }: ${line.trim()}`
        );
      }
    });
  } catch (error) {
    console.error(`❌ Error revisando ${filePath}:`, error.message);
  }
}

// Función para procesar todos los archivos
function processAllFiles() {
  try {
    const files = fs.readdirSync(routesDir);
    let totalFixed = 0;

    console.log("🔍 Buscando errores...\n");

    files.forEach((file) => {
      if (file.endsWith(".js")) {
        const filePath = path.join(routesDir, file);
        findErrors(filePath);
      }
    });

    console.log("\n🔧 Corrigiendo errores...\n");

    files.forEach((file) => {
      if (file.endsWith(".js")) {
        const filePath = path.join(routesDir, file);
        if (fixFile(filePath)) {
          totalFixed++;
        }
      }
    });

    console.log(`\n🎉 Proceso completado. ${totalFixed} archivos corregidos.`);
  } catch (error) {
    console.error("Error procesando directorio:", error.message);
  }
}

// Ejecutar el script
processAllFiles();
