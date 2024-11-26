
import styles from "../css/CardBook.module.css";

const CardBook = ({ book }) => {
  if (!book) {
    return <p>Selecciona un libro para ver los detalles</p>;
  }

  return (
    <div className={styles.card}>
      <img src={book.cover} alt={book.titulo} className={styles.cover} />
      <div className={styles.details}>
        <h2 className={styles.title}>{book.titulo}</h2>
        <p className={styles.genre}><strong>Género:</strong> {book.genero}</p>
        <p className={styles.synopsis}><strong>Sinopsis:</strong> {book.sinopsis}</p>
      </div>
    </div>
  );
};

export default CardBook;