import { useEffect, useState } from "react";

const useEmptyBooksModal = (books, isLoading = false) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Verificar si hay libros y si el usuario está autenticado
    const token = localStorage.getItem("token");
    const hasBooks = Array.isArray(books) && books.length > 0;

    // Solo mostrar el modal si:
    // 1. No está cargando
    // 2. Está autenticado
    // 3. No tiene libros
    if (!isLoading && token && !hasBooks) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [books, isLoading]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    closeModal,
  };
};

export default useEmptyBooksModal;
