import BooksRow from "./BooksRow";
import style from "../css/BooksListRow.module.css";

const BooksListRow = ({ books, error, loading, onBookClick }) => {
  if (loading) return <p>Cargando libros...</p>;
  if (error) return <p>Error al cargar los libros</p>;
  if (!books.length) return <p>No hay libros</p>;

  return (
    <div className={style.container}>
      {books.map((book) => (
        <div key={book.id} onClick={() => onBookClick(book)}>
          <BooksRow 
            titulo={book.titulo}
            autor={book.autor}
          />
        </div>
      ))}
    </div>
  );
};

export default BooksListRow;