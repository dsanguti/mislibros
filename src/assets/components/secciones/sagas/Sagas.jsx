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

      // Primero probar el endpoint de debug
      console.log("🔍 Probando endpoint de debug...");
      const debugResponse = await fetch(API_ENDPOINTS.SAGAS_DEBUG, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      const debugData = await debugResponse.json();
      console.log("🔍 Respuesta del debug:", debugData);

      if (!debugResponse.ok) {
        console.error("❌ Error en debug:", debugData);
        setError(`Error de debug: ${debugData.error}`);
        setIsLoading(false);
        return;
      }

      // Si el debug funciona, usar el endpoint normal
      const response = await fetch(API_ENDPOINTS.SAGAS, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError("Error al obtener sagas");
        console.error("Error en la solicitud:", errorData);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setSagas(data);
      } else {
        setError("Los datos no son un array válido");
        console.error("Datos inválidos:", data);
      }
    } catch (error) {
      setError("Error al obtener sagas");
      console.error("Error:", error);
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
          {/* Botón de debug temporal */}
          <div
            style={{
              position: "fixed",
              top: "10px",
              right: "10px",
              zIndex: 1000,
              background: "#ff6b6b",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              fontSize: "12px",
            }}
          >
            <button
              onClick={() => {
                const token = localStorage.getItem("token");
                const user = localStorage.getItem("user");
                console.log("🔍 DEBUG MOBILE:");
                console.log("Token:", token ? "PRESENTE" : "AUSENTE");
                console.log("User:", user ? "PRESENTE" : "AUSENTE");
                if (token) {
                  console.log("Token length:", token.length);
                  console.log("Token preview:", token.substring(0, 20) + "...");
                }
                if (user) {
                  console.log("User data:", JSON.parse(user));
                }

                // Probar petición HTTP directa
                console.log("🔍 Iniciando test HTTP...");
                console.log("URL:", API_ENDPOINTS.SAGAS_MOBILE_TEST);
                console.log("Token:", token ? "PRESENTE" : "AUSENTE");

                fetch(API_ENDPOINTS.SAGAS_MOBILE_TEST, {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                  credentials: "include",
                })
                  .then((response) => {
                    console.log("🔍 Response recibida:", response);
                    console.log("🔍 Status:", response.status);
                    console.log("🔍 OK:", response.ok);
                    return response.json();
                  })
                  .then((data) => {
                    console.log("🔍 Respuesta del test móvil:", data);
                    alert(
                      `Test HTTP:\nSuccess: ${data.success}\nError: ${
                        data.error || "Ninguno"
                      }\nSagas: ${data.sagas ? data.sagas.length : 0}`
                    );
                  })
                  .catch((error) => {
                    console.error("❌ Error en test HTTP:", error);
                    console.error("❌ Error name:", error.name);
                    console.error("❌ Error message:", error.message);
                    alert(`Error HTTP: ${error.name} - ${error.message}`);
                  });
              }}
              style={{
                background: "white",
                color: "#ff6b6b",
                border: "none",
                padding: "5px 10px",
                borderRadius: "3px",
              }}
            >
              Debug Token
            </button>
          </div>

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
