import { useEffect, useState } from "react";
import style from "../../../css/Sagas.module.css";
import BooksListRow from "../../BooksListRow";
import HeaderRow from "../../HeaderRow";

const MainComics = ({ comics, selectedComics, onBookClick }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        const filteredBooks = selectedComics
          ? comics.filter(book => book.sagaId === selectedComics.id)
          : comics;

        setBooks(filteredBooks);
      } catch (error) {
        setError("Error al filtrar los libros");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [selectedComics, comics]);

  return (
    <div className={style.mainSagaContainer}>
      <h4>Libros de Star Wars: {selectedComics?.title || "Todos los Comics"}</h4>
      <div className={style.containerListBooks}>
        <HeaderRow />
        <BooksListRow books={books} error={error} loading={loading} onBookClick={onBookClick} />
      </div>
    </div>
  );
};

export default MainComics;