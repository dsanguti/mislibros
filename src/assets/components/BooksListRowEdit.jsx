import style from "../css/BooksListRow.module.css";
import BooksRowEdit from "./BookRowEdit";


const BooksListRowEdit = ({ books = [], error, loading, onBookClick, onEditClick, onDeleteClick }) => {
  if (loading) return <p>Cargando libros...</p>;
  if (error) return <p>Error al cargar los libros</p>;
  if (!Array.isArray(books) || books.length === 0) return <p>No hay libros</p>;

  return (
    <div className={style.container}>
      {books.map((book) => (
        <div key={book.id} onClick={() => onBookClick(book)}>
          <BooksRowEdit titulo={book.titulo} autor={book.autor} genero={book.genero} onEditClick={() => onEditClick(book)} onDeleteClick={() => onDeleteClick(book)} />
        </div>
      ))}
    </div>
  );
};

export default BooksListRowEdit;