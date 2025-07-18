const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Validar que todas las credenciales estén presentes
const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ ERROR: Faltan variables de entorno de Cloudinary:");
  missingVars.forEach((varName) => console.error(`   - ${varName}`));
  console.error("Por favor, configura estas variables en Railway");
}

// Configurar Cloudinary solo si todas las credenciales están presentes
if (missingVars.length === 0) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log("✅ Cloudinary configurado correctamente");
} else {
  console.error("❌ Cloudinary no configurado - faltan credenciales");
}

// Logging para verificar configuración
console.log("=== CONFIGURACIÓN CLOUDINARY ===");
console.log(
  "Cloud Name:",
  process.env.CLOUDINARY_CLOUD_NAME ? "SET" : "NOT SET"
);
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "SET" : "NOT SET");
console.log(
  "API Secret:",
  process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET"
);
console.log("================================================");

// Configurar almacenamiento para carátulas de libros
const coverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mislibros/covers",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 400, height: 600, crop: "fill" },
      { quality: "auto" },
    ],
  },
});

// Configurar almacenamiento para carátulas de sagas
const sagaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mislibros/sagas",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 300, height: 400, crop: "fill" },
      { quality: "auto" },
    ],
  },
});

// Configurar almacenamiento para géneros
const genreStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mislibros/genres",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 200, height: 200, crop: "fill" },
      { quality: "auto" },
    ],
  },
});

// Configurar multer para carátulas de libros
const uploadCover = multer({ storage: coverStorage });

// Configurar multer para carátulas de sagas
const uploadSaga = multer({ storage: sagaStorage });

// Configurar multer para géneros
const uploadGenre = multer({ storage: genreStorage });

// Función para eliminar imagen de Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Imagen eliminada de Cloudinary:", result);
    return result;
  } catch (error) {
    console.error("Error al eliminar imagen de Cloudinary:", error);
    throw error;
  }
};

// Función para obtener URL de imagen
const getImageUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
};

// Función para extraer el public_id de una URL de Cloudinary
const extractPublicId = (url) => {
  if (!url || !url.includes("cloudinary.com")) {
    return null;
  }

  try {
    // Extraer el public_id de la URL de Cloudinary
    // Ejemplo: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/mislibros/covers/filename.jpg
    const urlParts = url.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    if (uploadIndex === -1) {
      return null;
    }

    // El public_id está después de 'upload' y antes de cualquier parámetro
    const publicIdParts = urlParts.slice(uploadIndex + 2);
    let publicId = publicIdParts.join("/");

    // Para archivos raw, mantener la extensión
    const isRawFile = url.includes("/raw/");
    if (!isRawFile) {
      // Remover la extensión del archivo si existe (solo para imágenes)
      const lastDotIndex = publicId.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        publicId = publicId.substring(0, lastDotIndex);
      }
    }

    return publicId;
  } catch (error) {
    console.error("Error al extraer public_id:", error);
    return null;
  }
};

// Función para eliminar archivo de Cloudinary (imagen o archivo)
const deleteCloudinaryFile = async (url, resourceType = "image") => {
  try {
    const publicId = extractPublicId(url);

    if (!publicId) {
      console.log("No se pudo extraer public_id de la URL:", url);
      return false;
    }

    console.log(
      `Eliminando archivo de Cloudinary: ${publicId} (tipo: ${resourceType})`
    );

    // Verificar si el archivo existe antes de intentar eliminarlo
    try {
      const info = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });
      console.log("✅ Archivo encontrado en Cloudinary:", info.public_id);
    } catch (infoError) {
      console.log("❌ Archivo no encontrado en Cloudinary:", infoError.message);
      return false;
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log("Archivo eliminado de Cloudinary:", result);
    return true;
  } catch (error) {
    console.error("Error al eliminar archivo de Cloudinary:", error);
    return false;
  }
};

module.exports = {
  cloudinary,
  uploadCover,
  uploadSaga,
  uploadGenre,
  deleteImage,
  getImageUrl,
  extractPublicId,
  deleteCloudinaryFile,
};
