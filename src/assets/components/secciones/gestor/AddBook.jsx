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
                const book = new epubjs.Book(arrayBuffer);
                await book.ready;
                setProgress(60);

                // Obtener los metadatos de manera más robusta
                const metadata = {
                  title: "",
                  author: "",
                  sinopsis: "",
                };

                try {
                  // Intentar obtener los metadatos de diferentes maneras
                  console.log("Objeto book completo:", book);

                  // Método 1: Usar book.metadata
                  const bookMetadata = await book.metadata;
                  console.log("Método 1 - book.metadata:", bookMetadata);

                  // Método 2: Usar book.package.metadata
                  const packageMetadata = book.package?.metadata;
                  console.log(
                    "Método 2 - book.package.metadata:",
                    packageMetadata
                  );

                  // Método 3: Intentar extraer sinopsis del primer capítulo
                  let chapterContent = "";
                  try {
                    console.log(
                      "Intentando extraer sinopsis del primer capítulo..."
                    );

                    // Esperar a que el libro esté completamente cargado
                    await book.ready;
                    console.log("Libro listo para extraer contenido");

                    // Obtener la navegación
                    const navigation = await book.navigation;
                    console.log("Navegación del libro:", navigation);

                    if (navigation && navigation.toc) {
                      // Buscar el primer elemento que no sea la portada o página de título
                      const firstContentChapter = navigation.toc.find(
                        (item) =>
                          item.href &&
                          !item.href.includes("cover") &&
                          !item.href.includes("titlepage")
                      );

                      if (firstContentChapter) {
                        console.log(
                          "Primer capítulo de contenido encontrado:",
                          firstContentChapter
                        );

                        // Intentar obtener el contenido usando el método spine
                        const spineItem = book.spine.get(
                          firstContentChapter.href
                        );
                        console.log(
                          "Elemento del spine encontrado:",
                          spineItem
                        );

                        if (spineItem) {
                          try {
                            // Cargar el contenido del capítulo
                            const content = await spineItem.load();
                            console.log("Contenido cargado:", content);

                            if (content && content.document) {
                              // Obtener el texto directamente del documento
                              let text = "";

                              // Intentar obtener el texto de diferentes maneras
                              try {
                                // Método 1: Usar textContent directamente
                                text = content.document.body.textContent;
                              } catch (e) {
                                console.warn(
                                  "Error al obtener textContent:",
                                  e
                                );

                                try {
                                  // Método 2: Usar innerText
                                  text = content.document.body.innerText;
                                } catch (e) {
                                  console.warn(
                                    "Error al obtener innerText:",
                                    e
                                  );

                                  // Método 3: Extraer texto de nodos de texto
                                  const textNodes = [];
                                  const walk = document.createTreeWalker(
                                    content.document.body,
                                    NodeFilter.SHOW_TEXT,
                                    null,
                                    false
                                  );

                                  let node;
                                  while ((node = walk.nextNode())) {
                                    textNodes.push(node.textContent);
                                  }

                                  text = textNodes.join(" ");
                                }
                              }

                              // Limpiar el texto
                              text = text
                                .replace(/\s+/g, " ")
                                .trim()
                                .replace(/v\s*\d+\.\d+/gi, "");

                              console.log(
                                "Texto extraído (primeros 200 caracteres):",
                                text.substring(0, 200)
                              );

                              // Tomar los primeros 500 caracteres como sinopsis
                              chapterContent = text.substring(0, 500) + "...";
                              console.log("Sinopsis final:", chapterContent);
                            }
                          } catch (loadError) {
                            console.warn(
                              "Error al cargar el contenido del capítulo:",
                              loadError
                            );
                          }
                        }
                      }
                    }
                  } catch (chapterError) {
                    console.warn(
                      "Error al extraer contenido del primer capítulo:",
                      chapterError
                    );
                  }

                  // Intentar extraer información de todas las fuentes posibles
                  if (bookMetadata) {
                    metadata.title =
                      bookMetadata.title || bookMetadata["dc:title"] || "";
                    metadata.author =
                      bookMetadata.creator ||
                      bookMetadata["dc:creator"] ||
                      bookMetadata.author ||
                      "";
                    metadata.sinopsis =
                      bookMetadata.description ||
                      bookMetadata["dc:description"] ||
                      bookMetadata.summary ||
                      "";
                  }

                  if (packageMetadata) {
                    metadata.title =
                      metadata.title ||
                      packageMetadata.title ||
                      packageMetadata["dc:title"] ||
                      "";
                    metadata.author =
                      metadata.author ||
                      packageMetadata.creator ||
                      packageMetadata["dc:creator"] ||
                      packageMetadata.author ||
                      "";
                    metadata.sinopsis =
                      metadata.sinopsis ||
                      packageMetadata.description ||
                      packageMetadata["dc:description"] ||
                      packageMetadata.summary ||
                      "";
                  }

                  // Si aún no tenemos sinopsis, añadir un mensaje informativo
                  if (!metadata.sinopsis) {
                    metadata.sinopsis =
                      "No se pudo extraer la sinopsis del archivo EPUB. Por favor, añade una descripción manualmente.";
                    console.log("No se encontró sinopsis en los metadatos");
                  }

                  // Si aún no tenemos título, usar el nombre del archivo
                  if (!metadata.title) {
                    metadata.title = file.name.replace(/\.[^/.]+$/, "");
                  }

                  // Si aún no tenemos autor, usar un valor por defecto
                  if (!metadata.author) {
                    metadata.author = "Autor desconocido";
                  }

                  console.log("Metadatos procesados:", metadata);
                } catch (metadataError) {
                  console.warn("Error al obtener metadatos:", metadataError);
                }

                setProgress(80);

                // Extraer la carátula
                let coverImage = null;
                try {
                  console.log("Intentando extraer carátula...");
                  const cover = await book.coverUrl();
                  console.log("URL de la carátula:", cover);

                  if (cover) {
                    console.log("Descargando imagen de la carátula...");
                    const response = await fetch(cover);
                    const coverBuffer = await response.arrayBuffer();
                    coverImage = arrayBufferToBlob(coverBuffer, "image/jpeg");
                    console.log("Carátula extraída correctamente");
                  } else {
                    console.log("No se encontró URL de carátula");
                  }
                } catch (coverError) {
                  console.warn(
                    "No se pudo extraer la carátula del EPUB:",
                    coverError
                  );
                }

                return {
                  title: metadata.title,
                  author: metadata.author,
                  sinopsis: metadata.sinopsis,
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
