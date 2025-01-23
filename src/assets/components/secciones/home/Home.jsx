import { useEffect, useState } from "react";
import style from "../../../css/Sagas.module.css";
import CardBook from "../../CardBook";
import MainHome from "./MainHome"; // Asegúrate de que el nombre del componente sea correcto
import Modal from "../../Modal"; // Importamos el modal

const Home = () => {
  const [books, setBooks] = useState([]); // Cambiado de sagas a books
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false); // Estado para el modal

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("No se encontró el token de autenticación");
          return;
        }

        const response = await fetch("http://localhost:8001/api/all_books", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError("Error al obtener all_books");
          console.error("Error en la solicitud:", errorData);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setBooks(data); // Cambiado de setSagas a setBooks
        } else {
          setError("Los datos no son un array válido");
          console.error("Datos inválidos:", data);
        }
      } catch (error) {
        setError("Error al obtener all_books");
        console.error("Error:", error);
      }
    };

    fetchAllBooks();
  }, []);

  const handleBookClick = (book) => {
    setSelectedBook(book);
    if (isMobile) {
      setModalOpen(true); // Abre el modal si es vista móvil
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBook(null);
  };

  return (
    <div className={style.container}>
      {error ? (
        <p className={style.error}>{error}</p>
      ) : (
        <>
          <div className={style.ContainerHeaderMain}>
            <MainHome
              className={style.main}
              books={books} // Cambiado de saga a books
              onBookClick={handleBookClick}
            />
          </div>
          {isMobile ? (
            <Modal isOpen={isModalOpen} onClose={closeModal}>
              {selectedBook && <CardBook book={selectedBook} />}
            </Modal>
          ) : (
            <div className={style.containerCard}>
              {selectedBook ? (
                <CardBook book={selectedBook} />
              ) : (
                <p>Seleccione un libro</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;