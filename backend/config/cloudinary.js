const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

module.exports = {
  cloudinary,
  uploadCover,
  uploadSaga,
  uploadGenre,
  deleteImage,
  getImageUrl,
};
