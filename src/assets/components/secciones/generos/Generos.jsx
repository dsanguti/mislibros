import { useEffect, useState } from "react";
import style from "../../../css/Genero.module.css";
import useEmptyBooksModal from "../../../hooks/useEmptyBooksModal";
import CardBook from "../../CardBook";
import EmptyBooksMessage from "../../EmptyBooksMessage";
import Modal from "../../Modal";
import HeaderGenero from "./HeaderGenero";
import MainGenero from "./MainGenero";
import { API_ENDPOINTS } from "../../../../config/api";

const Generos = () => {
  const [generos, setGeneros] = useState([]);
  const [selectedGenero, setSelectedGenero] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]); // Estado para todos los libros
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const { isModalOpen: isEmptyModalOpen, closeModal: closeEmptyModal } =
    useEmptyBooksModal(books, isLoading);

  const isMobile = window.innerWidth <= 768;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para obtener todos los libros
  const fetchAllBooks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setBooks([]);
        return;
      }

      const response = await fetch(API_ENDPOINTS.ALL_BOOKS, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setBooks(data);
        } else {
          setBooks([]);
        }
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error("Error al obtener libros:", error);
      setBooks([]);
    }
  };

  useEffect(() => {
    const fetchGeneros = async () => {
      setIsLoading(true); // Iniciar carga
      try {
        const authToken = localStorage.getItem("token");
        const response = await fetch(API_ENDPOINTS.GENEROS, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener géneros");
        }

        const data = await response.json();
        console.log("🎨 Géneros cargados:", data);
        setGeneros(data);
      } catch (err) {
        console.error("Error al cargar géneros:", err);
        setError("Error al cargar géneros.");
      } finally {
        setIsLoading(false); // Finalizar carga
      }
    };

    fetchGeneros();
    fetchAllBooks();

    // Escuchar eventos de libros para actualizar la lista
    const handleBookUpdated = () => {
      console.log("Evento bookUpdated recibido, actualizando lista de libros");
      fetchAllBooks();
    };

    window.addEventListener("bookAdded", handleBookUpdated);
    window.addEventListener("bookDeleted", handleBookUpdated);
    window.addEventListener("bookUpdated", handleBookUpdated);

    return () => {
      window.removeEventListener("bookAdded", handleBookUpdated);
      window.removeEventListener("bookDeleted", handleBookUpdated);
      window.removeEventListener("bookUpdated", handleBookUpdated);
    };
  }, []);

  const handleGeneroClick = (genero) => {
    console.log("🎯 Género seleccionado en Generos.jsx:", genero);
    setSelectedGenero(genero);
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
    if (isMobile) setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  return (
    <div className={style.container}>
      {error ? (
        <p className={style.error}>{error}</p>
      ) : (
        <>
          <div className={style.ContainerHeaderMain}>
            <HeaderGenero
              className={style.header}
              generos={generos}
              onGeneroClick={handleGeneroClick}
            />
            <MainGenero
              className={style.main}
              genero={selectedGenero}
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
          <EmptyBooksMessage
            isOpen={isEmptyModalOpen}
            onClose={closeEmptyModal}
          />
        </>
      )}
    </div>
  );
};

export default Generos;
