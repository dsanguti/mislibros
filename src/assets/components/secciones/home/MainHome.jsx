import { useEffect, useState } from "react";
import style from "../../../css/Sagas.module.css";
import BooksListRow from "../../BooksListRow";
import HeaderRow from "../../HeaderRow";
import Search from "../../Search";

const MainHome = ({ books, onBookClick }) => {
  const [libros, setLibros] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!books) return;

    const fetchLibros = async () => {
      setLoading(true);
      setError(null);

      try {
        setLibros(books);
        setFilteredBooks(books); // Inicialmente, los libros filtrados son todos los libros
      } catch (error) {
        setError("Error al procesar los libros");
        console.error("Error al procesar los libros:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibros();
  }, [books]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredBooks(libros); // Si no hay término de búsqueda, mostramos todos los libros
    } else {
      const filtered = libros.filter((book) =>
        book.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.genero.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  };

  return (
    <div className={style.mainSagaContainer}>
      <Search onSearch={handleSearch} />
      
      {books && (
        <>
          <div className={style.containerListBooks}>
            <HeaderRow />
            <BooksListRow books={filteredBooks} error={error} loading={loading} onBookClick={onBookClick} />
          </div>
        </>
      )}
    </div>
  );
};

export default MainHome;