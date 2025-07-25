// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: `${API_BASE_URL}/api/login`,
  REGISTER: `${API_BASE_URL}/api/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/reset-password`,
  VERIFY_EMAIL: `${API_BASE_URL}/api/verify-email`,

  // Libros
  ALL_BOOKS: `${API_BASE_URL}/api/all_books`,
  ADD_BOOK: `${API_BASE_URL}/api/add_book`,
  UPDATE_BOOK: `${API_BASE_URL}/api/update_book`,
  DELETE_BOOK: `${API_BASE_URL}/api/delete_book`,
  DOWNLOAD_BOOK: `${API_BASE_URL}/api/download-book`,
  UPDATE_FILE_URLS: `${API_BASE_URL}/api/update-file-urls`,
  EXTRACT_METADATA: `${API_BASE_URL}/api/extract_metadata`,
  EXTRACT_MOBI_METADATA: `${API_BASE_URL}/api/extract_mobi_metadata`,
  TEST_UPLOAD: `${API_BASE_URL}/api/test_upload`,
  TEST_FILE_UPLOAD: `${API_BASE_URL}/api/test_file_upload`,
  CLEANUP: `${API_BASE_URL}/api/cleanup`,

  // Sagas
  SAGAS: `${API_BASE_URL}/api/sagas`,
  CREATE_SAGA: `${API_BASE_URL}/api/create_saga`,
  UPDATE_SAGA: `${API_BASE_URL}/api/update_saga`,
  DELETE_SAGA: `${API_BASE_URL}/api/delete_saga`,
  LIBROS_SAGAS: `${API_BASE_URL}/api/libros-sagas`,

  // Géneros
  GENEROS: `${API_BASE_URL}/api/generos`,
  GENERO_ENUM: `${API_BASE_URL}/api/generoEnum`,
  LIBROS_GENERO: `${API_BASE_URL}/api/libros-genero`,

  // Categorías especiales
  LIBROS_STARWARS: `${API_BASE_URL}/api/librosStarwars`,
  LIBROS_COMICS: `${API_BASE_URL}/api/librosComics`,

  // Usuarios (Admin)
  ALL_USERS: `${API_BASE_URL}/api/all_users`,
  ADD_USER: `${API_BASE_URL}/api/add_user`,
  UPDATE_USER: `${API_BASE_URL}/api/update_user`,
  DELETE_USER: `${API_BASE_URL}/api/delete_user`,

  // Imágenes
  IMAGES: `${API_BASE_URL}/images`,
  UPLOADS: `${API_BASE_URL}/uploads`,
  TEMP_IMAGES: `${API_BASE_URL}`,
};

export default API_ENDPOINTS;
