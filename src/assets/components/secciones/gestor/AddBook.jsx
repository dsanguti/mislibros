import * as epubjs from "epubjs";
import * as pdfjsLib from "pdfjs-dist";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
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

  // Configuración de los tipos de archivo permitidos
  const acceptedFileTypes = {
    "application/epub+zip": [".epub"],
    "application/pdf": [".pdf"],
    "application/x-mobipocket-ebook": [".mobi"],
  };

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
            // Función para extraer metadatos de un archivo EPUB
            const extractEpubMetadata = async (file) => {
              try {
                setProgress(20);
                const arrayBuffer = await file.arrayBuffer();
                setProgress(40);
                const book = epubjs.Book(arrayBuffer);
                setProgress(60);
                const metadata = await book.loaded.metadata;
                setProgress(80);

                // Extraer la carátula
                let coverImage = null;
                try {
                  const cover = await book.coverUrl();
                  if (cover) {
                    const response = await fetch(cover);
                    const coverBuffer = await response.arrayBuffer();
                    coverImage = arrayBufferToBlob(coverBuffer, "image/jpeg");
                  }
                } catch (coverError) {
                  console.warn(
                    "No se pudo extraer la carátula del EPUB:",
                    coverError
                  );
                }

                return {
                  title: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
                  author: metadata.creator || "Autor desconocido",
                  sinopsis: metadata.description || "",
                  cover: coverImage,
                };
              } catch (error) {
                console.error("Error al extraer metadatos del EPUB:", error);
                throw new Error(
                  "No se pudieron extraer los metadatos del archivo EPUB"
                );
              }
            };

            extractedMetadata = await extractEpubMetadata(file);
          } else if (file.type === "application/pdf") {
            // Función para extraer metadatos de un archivo PDF
            const extractPdfMetadata = async (file) => {
              try {
                setProgress(20);
                const arrayBuffer = await file.arrayBuffer();
                setProgress(40);
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer })
                  .promise;
                setProgress(60);
                const metadata = await pdf.getMetadata();
                setProgress(80);

                // Extraer la carátula (primera página como imagen)
                let coverImage = null;
                try {
                  const page = await pdf.getPage(1);
                  const viewport = page.getViewport({ scale: 1.0 });
                  const canvas = document.createElement("canvas");
                  const context = canvas.getContext("2d");
                  canvas.height = viewport.height;
                  canvas.width = viewport.width;

                  await page.render({
                    canvasContext: context,
                    viewport: viewport,
                  }).promise;

                  // Convertir canvas a blob
                  coverImage = await new Promise((resolve) => {
                    canvas.toBlob(resolve, "image/jpeg", 0.95);
                  });
                } catch (coverError) {
                  console.warn(
                    "No se pudo extraer la carátula del PDF:",
                    coverError
                  );
                }

                return {
                  title:
                    metadata.info?.Title || file.name.replace(/\.[^/.]+$/, ""),
                  author: metadata.info?.Author || "Autor desconocido",
                  sinopsis: metadata.info?.Subject || "",
                  cover: coverImage,
                };
              } catch (error) {
                console.error("Error al extraer metadatos del PDF:", error);
                throw new Error(
                  "No se pudieron extraer los metadatos del archivo PDF"
                );
              }
            };

            extractedMetadata = await extractPdfMetadata(file);
          } else if (file.type === "application/x-mobipocket-ebook") {
            // Función para extraer metadatos de un archivo MOBI
            const extractMobiMetadata = async (file) => {
              setProgress(50);
              // Para MOBI, por ahora solo extraemos información básica
              // La extracción de carátula de MOBI requeriría una librería específica
              return {
                title: file.name.replace(/\.[^/.]+$/, ""),
                author: "Autor desconocido",
                sinopsis: "",
                cover: null,
              };
            };

            extractedMetadata = await extractMobiMetadata(file);
          } else {
            throw new Error("Formato de archivo no soportado");
          }

          setProgress(100);
          setMetadata(extractedMetadata);
          setShowForm(true);
          toast.success("Metadatos extraídos correctamente");
        } catch (error) {
          console.error("Error al procesar el archivo:", error);
          setError(error.message || "Error al procesar el archivo");
          toast.error(error.message || "Error al procesar el archivo");
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
    accept: acceptedFileTypes,
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
    toast.success("Libro añadido correctamente");
    handleCloseForm();
  };

  // Manejar el error al añadir un libro
  const handleError = (error) => {
    setError(error);
    toast.error(error);
  };

  return (
    <div className={style.container}>
      <h2>Añadir nuevo libro</h2>

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
            <p className={style.fileTypes}>
              Formatos aceptados: EPUB, PDF, MOBI
            </p>
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
