import { useEffect, useState } from "react";
import style from "../../../css/Sagas.module.css";
import CardBook from "../../CardBook";
import Modal from "../../Modal";
import DeleteBookForm from "./DeleteBookForm";
import EditBookForm from "./EditBookForm";
import MainEditBooks from "./MainEditBooks";
import { API_ENDPOINTS } from "../../../config/api";

const EditBooks = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si estamos editando
  const [isDeleting, setIsDeleting] = useState(false); // Estado para saber si estamos eliminando
  const [updateFlag, setUpdateFlag] = useState(false);

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
        const authToken = localStorage.getItem("token");
        if (!authToken) {
          setError("No se encontró el token de autenticación");
          return;
        }

        const response = await fetch(API_ENDPOINTS.ALL_BOOKS, {
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
  }, [updateFlag]);

  const handleBookClick = (book) => {
    setSelectedBook(book);
    setIsEditing(false); // No estamos editando, solo mostrando el libro
    setIsDeleting(false); // No estamos eliminando
    if (isMobile) {
      setModalOpen(true);
    }
  };

  const handleEditClick = (book) => {
    setSelectedBook(book);
    setIsEditing(true); // Ahora sí estamos editando
    setIsDeleting(false); // No estamos eliminando
    setModalOpen(true);
  };

  const handleDeleteClick = (book) => {
    setSelectedBook(book);
    setIsDeleting(true); // Ahora sí estamos eliminando
    setIsEditing(false); // No estamos editando
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBook(null);
    setIsEditing(false);
    setIsDeleting(false);
  };

  const handleUpdate = () => {
    setUpdateFlag((prev) => !prev);
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
            <Modal
              isOpen={isModalOpen}
              onClose={closeModal}
              modalType={isEditing ? "editBook" : undefined}
            >
              {selectedBook &&
                (isEditing ? (
                  <EditBookForm
                    book={selectedBook}
                    onClose={closeModal}
                    onUpdate={handleUpdate}
                  />
                ) : isDeleting ? (
                  <DeleteBookForm
                    book={selectedBook}
                    onClose={closeModal}
                    onDelete={handleUpdate}
                  />
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

          {/* Modal de edición/eliminación en escritorio */}
          {!isMobile &&
            isModalOpen &&
            selectedBook &&
            (isEditing || isDeleting) && (
              <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                modalType={isEditing ? "editBook" : undefined}
              >
                {isEditing ? (
                  <EditBookForm
                    book={selectedBook}
                    onClose={closeModal}
                    onUpdate={handleUpdate}
                  />
                ) : (
                  <DeleteBookForm
                    book={selectedBook}
                    onClose={closeModal}
                    onDelete={handleUpdate}
                  />
                )}
              </Modal>
            )}
        </>
      )}
    </div>
  );
};

export default EditBooks;
