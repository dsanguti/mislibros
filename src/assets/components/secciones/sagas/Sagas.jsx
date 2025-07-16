import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../../../config/api";
import style from "../../../css/Sagas.module.css";
import useEmptyBooksModal from "../../../hooks/useEmptyBooksModal";
import CardBook from "../../CardBook";
import EmptyBooksMessage from "../../EmptyBooksMessage";
import Modal from "../../Modal"; // Importamos el modal
import HeaderSaga from "./HeaderSaga";
import MainSaga from "./MainSaga";

const Sagas = () => {
  const [sagas, setSagas] = useState([]);
  const [selectedSaga, setSelectedSaga] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false); // Estado para el modal
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

  // Función para obtener las sagas
  const fetchSagas = async () => {
    setIsLoading(true); // Iniciar carga
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No se encontró el token de autenticación");
        setIsLoading(false);
        return;
      }

      console.log("🔍 Iniciando fetchSagas...");
      console.log("URL:", API_ENDPOINTS.SAGAS);
      console.log("Token:", token ? "PRESENTE" : "AUSENTE");

      // Versión robusta para móvil
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(API_ENDPOINTS.SAGAS, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        signal: controller.signal,
        mode: "cors",
        cache: "no-cache",
      });

      clearTimeout(timeoutId);
      console.log("🔍 Response recibida:", response);
      console.log("🔍 Status:", response.status);
      console.log("🔍 OK:", response.ok);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error en la solicitud:", errorData);
        setError(`Error HTTP ${response.status}: ${response.statusText}`);
        setIsLoading(false);
        return;
      }

      const text = await response.text();
      console.log("🔍 Response text:", text);

      try {
        const data = JSON.parse(text);
        console.log("🔍 Sagas parseadas:", data);

        if (Array.isArray(data)) {
          setSagas(data);
          console.log("✅ Sagas cargadas correctamente:", data.length);
        } else {
          setError("Los datos no son un array válido");
          console.error("Datos inválidos:", data);
        }
      } catch (parseError) {
        console.error("❌ Error parsing JSON:", parseError);
        setError(`Error parsing JSON: ${parseError.message}`);
      }
    } catch (error) {
      console.error("❌ Error en fetchSagas:", error);
      console.error("❌ Error name:", error.name);
      console.error("❌ Error message:", error.message);

      if (error.name === "AbortError") {
        setError("Error: Timeout - La petición tardó demasiado");
      } else {
        setError(`Error al obtener sagas: ${error.message}`);
      }
    } finally {
      setIsLoading(false); // Finalizar carga
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
    // Cargar las sagas y libros al montar el componente
    fetchSagas();
    fetchAllBooks();

    // Escuchar el evento sagaUpdated para actualizar la lista cuando se crea, edita o elimina una saga
    const handleSagaUpdated = () => {
      console.log("Evento sagaUpdated recibido, actualizando lista de sagas");
      fetchSagas();
    };

    // Escuchar eventos de libros para actualizar la lista
    const handleBookUpdated = () => {
      console.log("Evento bookUpdated recibido, actualizando lista de libros");
      fetchAllBooks();
    };

    window.addEventListener("sagaUpdated", handleSagaUpdated);
    window.addEventListener("bookAdded", handleBookUpdated);
    window.addEventListener("bookDeleted", handleBookUpdated);
    window.addEventListener("bookUpdated", handleBookUpdated);

    // Limpiar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener("sagaUpdated", handleSagaUpdated);
      window.removeEventListener("bookAdded", handleBookUpdated);
      window.removeEventListener("bookDeleted", handleBookUpdated);
      window.removeEventListener("bookUpdated", handleBookUpdated);
    };
  }, []); // No incluimos fetchSagas en las dependencias para evitar bucles infinitos

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
            <HeaderSaga
              className={style.header}
              sagas={sagas}
              onSagaClick={setSelectedSaga}
            />
            <MainSaga
              className={style.main}
              saga={selectedSaga}
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

export default Sagas;
