import BooksRow from "./BooksRow";
import style from "../css/BooksListRow.module.css";

const BooksListRow = ({ books, error, loading }) => {
  if (loading) return <p>Cargando libros...</p>;
  if (error) return <p>Error al cargar los libros</p>;
  if (!books.length) return <p>No hay libros</p>;

  return (
    <div className={style.container}>
      {books.map((book) => (
        <BooksRow 
          key={book.id}
          titulo={book.titulo}
          autor={book.autor}
          genero={book.genero}
        />
      ))}
    </div>
  );
};

export default BooksListRow;
