import BooksRow from "./BooksRow"

const BooksListRow = ({ books, error, loading }) => {
  if (loading) return <p> Cargando usuarios...</p>;
  if (error) return <p>Error al cargar los usuarios</p>;
  if (!books.length) return <p>No hay usuarios</p>;

  return books.map((book) => <BooksRow key={book.id} {...book} />);
};

export default BooksListRow;