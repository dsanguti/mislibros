import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../config/api";
import styles from "../css/CardBook.module.css";
import Epub_Icon from "./icons/Epub_Icon";
import Tooltip from "./Tooltip";

const CardBook = ({ book }) => {
  if (!book) {
    return <p>Selecciona un libro para ver los detalles</p>;
  }

  const handleDownload = async () => {
    if (!book.file) {
      toast.error("Este libro no tiene un archivo disponible para descargar");
      return;
    }

    try {
      // Obtener el token de autenticación
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("No tienes permisos para descargar este archivo");
        return;
      }

      // Usar el nuevo endpoint de descarga
      const response = await fetch(
        `${API_ENDPOINTS.DOWNLOAD_BOOK}/${book.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Convertir la respuesta a blob
      const blob = await response.blob();

      // Crear URL del blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Crear un enlace temporal
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `${book.titulo}.epub`);
      link.style.display = "none";

      // Añadir al DOM, hacer clic y luego remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar la URL del blob
      window.URL.revokeObjectURL(blobUrl);

      toast.success(`Descargando "${book.titulo}"`);
    } catch (error) {
      console.error("Error al descargar el libro:", error);
      toast.error("Ocurrió un error al intentar descargar el libro");
    }
  };

  return (
    <div className={styles.card}>
      <img src={book.cover} alt={book.titulo} className={styles.cover} />
      <div className={styles.details}>
        <div className={styles.titleWrapper}>
          <h2 className={styles.title}>{book.titulo}</h2>
          <div className={styles.epubIconContainer}>
            <Tooltip
              text="Descargar libro"
              position="top"
              theme="default"
              size="small"
            >
              <Epub_Icon className={styles.epubIcon} onClick={handleDownload} />
            </Tooltip>
          </div>
        </div>
        <p className={styles.genre}>
          <strong>Género:</strong> {book.genero}
        </p>
        <p className={styles.synopsis}>
          <strong>Sinopsis:</strong> {book.sinopsis}
        </p>
      </div>
    </div>
  );
};

export default CardBook;
