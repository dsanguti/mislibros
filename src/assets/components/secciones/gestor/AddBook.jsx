import * as pdfjsLib from "pdfjs-dist";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../../../config/api";
import style from "../../../css/AddBook.module.css";
import AddBookForm from "./AddBookForm";

// Configurar el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const AddBook = () => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [progress, setProgress] = useState(0);

  // Función que se ejecuta cuando se suelta un archivo
  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFile(file);
        setLoading(true);
        setError(null);
        setProgress(0);

        try {
          let extractedMetadata;

          // Función para convertir ArrayBuffer a Blob
          const arrayBufferToBlob = (buffer, type) => {
            return new Blob([buffer], { type });
          };

          // Extraer metadatos según el tipo de archivo
          if (file.type === "application/epub+zip") {
            // Para archivos EPUB, usar la ruta del backend (igual que PDF y MOBI)
            try {
              console.log("🚀 Iniciando procesamiento de EPUB desde móvil...");
              setProgress(20);
              const formData = new FormData();
              formData.append("file", file);

              console.log(
                "📤 Enviando petición a:",
                API_ENDPOINTS.EXTRACT_METADATA
              );
              console.log("📁 Archivo:", file.name, "Tamaño:", file.size);

              const response = await fetch(API_ENDPOINTS.EXTRACT_METADATA, {
                method: "POST",
                body: formData,
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                // Añadir timeout más largo para archivos grandes
                signal: AbortSignal.timeout(120000), // 2 minutos
              });

              console.log(
                "📥 Respuesta recibida:",
                response.status,
                response.statusText
              );

              if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Error en la respuesta:", errorData);
                throw new Error(
                  errorData.message ||
                    "Error al extraer metadatos del archivo EPUB"
                );
              }

              const metadata = await response.json();
              console.log("Metadatos extraídos del EPUB:", metadata);

              // Convertir la URL de la portada a Blob si existe
              let coverImage = null;
              if (metadata.cover) {
                try {
                  const coverResponse = await fetch(
                    `${API_ENDPOINTS.IMAGES}${metadata.cover}`
                  );
                  const coverBuffer = await coverResponse.arrayBuffer();
                  coverImage = arrayBufferToBlob(coverBuffer, "image/jpeg");
                } catch (coverError) {
                  console.warn("Error al cargar la portada:", coverError);
                }
              }

              extractedMetadata = {
                title: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
                author: metadata.author || "Autor desconocido",
                sinopsis:
                  metadata.sinopsis ||
                  "No se pudo extraer la sinopsis del archivo EPUB.",
                cover: coverImage,
              };

              setProgress(100);

              // Limpiar archivos temporales después de procesarlos
              try {
                await fetch(API_ENDPOINTS.CLEANUP, {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                });
              } catch (cleanupError) {
                console.warn(
                  "Error al limpiar archivos temporales:",
                  cleanupError
                );
              }
            } catch (error) {
              console.error("Error al procesar el archivo EPUB:", error);
              throw new Error(
                "No se pudieron extraer los metadatos del archivo EPUB"
              );
            }
          } else if (file.type === "application/pdf") {
            // Para archivos PDF, usar la ruta del backend
            try {
              setProgress(20);
              const formData = new FormData();
              formData.append("file", file);

              const response = await fetch(API_ENDPOINTS.EXTRACT_METADATA, {
                method: "POST",
                body: formData,
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                // Añadir timeout más largo para archivos grandes
                signal: AbortSignal.timeout(120000), // 2 minutos
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                  errorData.message ||
                    "Error al extraer metadatos del archivo PDF"
                );
              }

              const metadata = await response.json();
              console.log("Metadatos extraídos del PDF:", metadata);

              // Convertir la URL de la portada a Blob si existe
              let coverImage = null;
              if (metadata.cover) {
                try {
                  const coverResponse = await fetch(
                    `${API_ENDPOINTS.IMAGES}${metadata.cover}`
                  );
                  const coverBuffer = await coverResponse.arrayBuffer();
                  coverImage = arrayBufferToBlob(coverBuffer, "image/png");
                } catch (coverError) {
                  console.warn("Error al cargar la portada:", coverError);
                }
              }

              extractedMetadata = {
                title: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
                author: metadata.author || "Autor desconocido",
                sinopsis:
                  metadata.sinopsis ||
                  "No se pudo extraer la sinopsis del archivo PDF.",
                cover: coverImage,
              };

              setProgress(100);

              // Limpiar archivos temporales después de procesarlos
              try {
                await fetch(API_ENDPOINTS.CLEANUP, {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                });
              } catch (cleanupError) {
                console.warn(
                  "Error al limpiar archivos temporales:",
                  cleanupError
                );
              }
            } catch (error) {
              console.error("Error al procesar el archivo PDF:", error);
              throw new Error(
                "No se pudieron extraer los metadatos del archivo PDF"
              );
            }
          } else if (file.type === "application/x-mobipocket-ebook") {
            // Para archivos MOBI, usar la ruta del backend
            try {
              setProgress(20);
              const formData = new FormData();
              formData.append("file", file);

              const response = await fetch(API_ENDPOINTS.EXTRACT_METADATA, {
                method: "POST",
                body: formData,
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                // Añadir timeout más largo para archivos grandes
                signal: AbortSignal.timeout(120000), // 2 minutos
              });

              if (!response.ok) {
                throw new Error("Error al extraer metadatos del archivo MOBI");
              }

              const metadata = await response.json();
              console.log("Metadatos extraídos del MOBI:", metadata);

              // Convertir la URL de la portada a Blob si existe
              let coverImage = null;
              if (metadata.cover) {
                try {
                  const coverResponse = await fetch(
                    `${API_ENDPOINTS.IMAGES}${metadata.cover}`
                  );
                  const coverBuffer = await coverResponse.arrayBuffer();
                  coverImage = arrayBufferToBlob(coverBuffer, "image/jpeg");
                } catch (coverError) {
                  console.warn("Error al cargar la portada:", coverError);
                }
              }

              extractedMetadata = {
                title: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
                author: metadata.author || "Autor desconocido",
                sinopsis:
                  metadata.sinopsis ||
                  "No se pudo extraer la sinopsis del archivo MOBI.",
                cover: coverImage,
              };

              setProgress(100);
            } catch (error) {
              console.error("Error al procesar el archivo MOBI:", error);
              throw new Error(
                "No se pudieron extraer los metadatos del archivo MOBI"
              );
            }
          } else {
            throw new Error("Formato de archivo no soportado");
          }

          setMetadata(extractedMetadata);
          setShowForm(true);
          toast.success("Metadatos extraídos correctamente");
        } catch (error) {
          console.error("Error al procesar el archivo:", error);

          // Mensajes de error más específicos para dispositivos móviles
          let errorMessage = "Error al procesar el archivo";

          if (error.name === "AbortError" || error.name === "TimeoutError") {
            errorMessage =
              "El archivo es demasiado grande o la conexión es lenta. Intenta con un archivo más pequeño o mejora tu conexión.";
          } else if (
            error.message.includes("NetworkError") ||
            error.message.includes("Failed to fetch")
          ) {
            errorMessage =
              "Error de conexión. Verifica tu conexión a internet e intenta de nuevo.";
          } else if (
            error.message.includes("413") ||
            error.message.includes("Payload Too Large")
          ) {
            errorMessage =
              "El archivo es demasiado grande. Intenta con un archivo más pequeño.";
          } else {
            errorMessage = error.message || "Error al procesar el archivo";
          }

          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
          setProgress(0);
        }
      }
    },
    [setFile, setLoading, setError, setProgress, setMetadata, setShowForm]
  );

  // Configuración de react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/epub+zip": [".epub"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  // Manejar el cierre del formulario
  const handleCloseForm = () => {
    setShowForm(false);
    setFile(null);
    setMetadata(null);
    setError(null);
  };

  // Manejar el éxito al añadir un libro
  const handleSuccess = () => {
    toast.success("Libro añadido correctamente", { autoClose: 1000 });
    handleCloseForm();
  };

  // Manejar el error al añadir un libro
  const handleError = (error) => {
    setError(error);
    toast.error(error);
  };

  return (
    <div className={style.container}>
      {!showForm && <h2>Añadir nuevo libro</h2>}

      {!showForm && (
        <div className={style.dropzoneContainer}>
          <div
            {...getRootProps()}
            className={`${style.dropzone} ${isDragActive ? style.active : ""}`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Suelta el archivo aquí...</p>
            ) : (
              <p>
                Arrastra y suelta un archivo de libro aquí, o haz clic para
                seleccionar
              </p>
            )}
            <p className={style.fileTypes}>Formatos aceptados: EPUB y PDF</p>
          </div>
        </div>
      )}

      {loading && (
        <div className={style.loadingContainer}>
          <p className={style.loading}>Procesando archivo...</p>
          <div className={style.progressBar}>
            <div
              className={style.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className={style.error}>{error}</p>}

      {file && !loading && !showForm && (
        <div className={style.fileInfo}>
          <h3>Información del archivo:</h3>
          <p>
            <strong>Nombre:</strong> {file.name}
          </p>
          <p>
            <strong>Tamaño:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      {metadata && !showForm && (
        <div className={style.metadataInfo}>
          <h3>Metadatos extraídos:</h3>
          <div className={style.metadataGrid}>
            <p>
              <strong>Título:</strong> {metadata.title}
            </p>
            <p>
              <strong>Autor:</strong> {metadata.author}
            </p>
          </div>
          {metadata.sinopsis && (
            <div className={style.description}>
              <strong>Sinopsis:</strong>
              <p>{metadata.sinopsis}</p>
            </div>
          )}
          {metadata.cover && (
            <div className={style.coverPreview}>
              <strong>Carátula extraída:</strong>
              <img
                src={URL.createObjectURL(metadata.cover)}
                alt="Carátula del libro"
              />
            </div>
          )}
          <div className={style.formActions}>
            <button
              className={style.cancelButton}
              onClick={() => {
                setFile(null);
                setMetadata(null);
              }}
            >
              Cancelar
            </button>
            <button
              className={style.editButton}
              onClick={() => setShowForm(true)}
            >
              Continuar y editar información
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <AddBookForm
          metadata={metadata}
          file={file}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default AddBook;
