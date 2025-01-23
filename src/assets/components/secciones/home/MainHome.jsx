import { useEffect, useState } from "react";
import style from "../../../css/Sagas.module.css";
import BooksListRow from "../../BooksListRow";
import HeaderRow from "../../HeaderRow";
import Search from "../../Search";

const MainHome = ({ books, onBookClick }) => {
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!books) return;

    const fetchLibros = async () => {
      setLoading(true);
      setError(null);

      try {
        // Aquí asumimos que books ya contiene los libros pasados desde el componente padre
        setLibros(books);
      } catch (error) {
        setError("Error al procesar los libros");
        console.error("Error al procesar los libros:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibros();
  }, [books]);

  return (
    <div className={style.mainSagaContainer}>
      <Search />
      
      {books && (
        <>
          <div className={style.containerListBooks}>
            <HeaderRow />
            <BooksListRow books={libros} error={error} loading={loading} onBookClick={onBookClick} />
          </div>
        </>
      )}
    </div>
  );
};

export default MainHome;