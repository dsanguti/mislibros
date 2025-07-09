import { useEffect, useState } from "react";
import style from "../../../css/Sagas.module.css";
import useEmptyBooksModal from "../../../hooks/useEmptyBooksModal";
import CardBook from "../../CardBook";
import EmptyBooksMessage from "../../EmptyBooksMessage";
import Modal from "../../Modal";
import HeaderStarwars from "./HeaderStarwars";
import MainStarwars from "./MainStarwars";

const StarWars = () => {
  const [starwars, setStarwars] = useState([]);
  const [selectedStarwars, setSelectedStarwars] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [books, setBooks] = useState([]); // Estado para todos los libros
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const { isModalOpen: isEmptyModalOpen, closeModal: closeEmptyModal } =
    useEmptyBooksModal(books, isLoading);

  // Función para obtener todos los libros
  const fetchAllBooks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setBooks([]);
        return;
      }

      const response = await fetch("http://localhost:8001/api/all_books", {
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
    const handleResize = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchStarwars = async () => {
      setIsLoading(true); // Iniciar carga
      try {
        const authToken = localStorage.getItem("token");
        if (!authToken) {
          setError("No se encontró el token de autenticación");
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:8001/api/librosStarwars",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          setError("Error al obtener libros de Star Wars");
          console.error("Error en la solicitud:", errorData);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setStarwars(data);
        } else {
          setError("Los datos no son un array válido");
          console.error("Datos inválidos:", data);
        }
      } catch (error) {
        setError("Error al obtener libros de Star Wars");
        console.error("Error:", error);
      } finally {
        setIsLoading(false); // Finalizar carga
      }
    };

    if (starwars.length === 0) {
      fetchStarwars();
    }
  }, [starwars.length]);

  useEffect(() => {
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

  useEffect(() => {
    console.log("🎯 Estado actualizado de selectedBook:", selectedBook);
  }, [selectedBook]);

  const handleStarwarsClick = (selected) => {
    console.log("Elemento seleccionado en StarWars.jsx:", selected);
    if (!selected || !selected.id) {
      console.error(
        "Error: el elemento seleccionado no tiene ID válido",
        selected
      );
      return;
    }
    setSelectedStarwars(selected);
  };

  const handleBookClick = (book) => {
    console.log("Libro seleccionado en StarWars.jsx:", book);

    if (!book || !book.id) {
      console.error("❌ Error: el libro no tiene un ID válido", book);
      return;
    }
    setSelectedBook(book);
    if (isMobile) {
      setModalOpen(true);
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
            <HeaderStarwars
              className={style.header}
              starwars={starwars}
              selectedStarwars={selectedStarwars}
              onStarwarsClick={handleStarwarsClick}
              onBookClick={handleBookClick}
            />
            <MainStarwars
              className={style.main}
              starwars={starwars} // Pasamos los libros a MainStarwars
              selectedStarwars={selectedStarwars}
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

export default StarWars;
