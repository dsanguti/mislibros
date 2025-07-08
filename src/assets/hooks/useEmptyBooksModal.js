import { useEffect, useState } from "react";

const useEmptyBooksModal = (books) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Verificar si hay libros y si el usuario está autenticado
    const token = localStorage.getItem("token");
    const hasBooks = Array.isArray(books) && books.length > 0;

    // Mostrar el modal si está autenticado y no tiene libros
    if (token && !hasBooks) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [books]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    closeModal,
  };
};

export default useEmptyBooksModal;
