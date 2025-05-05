import { toast } from "react-toastify";
import styles from "../css/CardBook.module.css";
import Epub_Icon from "./icons/Epub_Icon";

const CardBook = ({ book }) => {
  if (!book) {
    return <p>Selecciona un libro para ver los detalles</p>;
  }

  const handleDownload = () => {
    if (!book.file) {
      toast.error("Este libro no tiene un archivo disponible para descargar");
      return;
    }

    try {
      // Crear un enlace temporal
      const link = document.createElement("a");
      link.href = book.file;

      // Extraer el nombre del archivo de la URL
      const fileName = book.file.split("/").pop() || `${book.titulo}.epub`;

      // Establecer el nombre del archivo
      link.setAttribute("download", fileName);

      // Ocultar el enlace
      link.style.display = "none";

      // Añadir al DOM, hacer clic y luego remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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
            <Epub_Icon
              className={styles.epubIcon}
              onClick={handleDownload}
              title="Descargar libro"
            />
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
