import { useEffect, useState } from "react";
import style from "../../../css/Sagas.module.css";
import CardBook from "../../CardBook";
import MainEditBooks from "./MainEditBooks";
import Modal from "../../Modal";
import EditBookForm from "./EditBookForm";

const EditBooks = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si estamos editando

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
          setBooks(data);
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
    setIsEditing(false); // No estamos editando, solo mostrando el libro
    if (isMobile) {
      setModalOpen(true);
    }
  };

  const handleEditClick = (book) => {
    setSelectedBook(book);
    setIsEditing(true); // Ahora sí estamos editando
    setModalOpen(true);
  };

  const handleDeleteClick = (book) => {
    console.log("Eliminar libro:", book);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBook(null);
    setIsEditing(false);
  };

  return (
    <div className={style.container}>
      {error ? (
        <p className={style.error}>{error}</p>
      ) : (
        <>
          <div className={style.ContainerHeaderMain}>
            <MainEditBooks
              className={style.main}
              books={books}
              onBookClick={handleBookClick}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
            />
          </div>

          {/* Modal en vista móvil */}
          {isMobile ? (
            <Modal isOpen={isModalOpen} onClose={closeModal}>
              {selectedBook && (isEditing ? (
                <EditBookForm book={selectedBook} onClose={closeModal} />
              ) : (
                <CardBook book={selectedBook} />
              ))}
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

          {/* Modal de edición en escritorio */}
          {!isMobile && isModalOpen && selectedBook && isEditing && (
            <Modal isOpen={isModalOpen} onClose={closeModal}>
              <EditBookForm book={selectedBook} onClose={closeModal} />
            </Modal>
          )}
        </>
      )}
    </div>
  );
};

export default EditBooks;
