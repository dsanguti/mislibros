import style from "../css/BooksListRow.module.css";
import BooksRow from "./BooksRow";

const BooksListRow = ({ books = [], error, loading, onBookClick }) => {
  if (loading) return <p>Cargando libros...</p>;
  if (error) return <p>Error al cargar los libros</p>;
  if (!Array.isArray(books) || books.length === 0) return <p>No hay libros</p>;

  return (
    <div className={style.container}>
      {books.map((book) => (
        <div key={book.id} onClick={() => onBookClick(book)}>
          <BooksRow
            titulo={book.titulo}
            autor={book.autor}
            genero={book.genero}
          />
        </div>
      ))}
    </div>
  );
};

export default BooksListRow;
