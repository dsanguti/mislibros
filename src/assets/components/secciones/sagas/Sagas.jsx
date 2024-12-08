import { useEffect, useState } from "react";
import style from "../../../css/Sagas.module.css";
import CardBook from "../../CardBook";
import HeaderSaga from "./HeaderSaga";
import MainSaga from "./MainSaga";

const Sagas = () => {
  const [sagas, setSagas] = useState([]);
  const [selectedSaga, setSelectedSaga] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null); // Nuevo estado para el libro seleccionado
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSagas = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        console.log("Token de autenticación:", authToken);

        if (!authToken) {
          setError("No se encontró el token de autenticación");
          return;
        }

        const response = await fetch("http://localhost:8001/api/sagas", {
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
          console.error("Error en la solicitud:", errorData);
          setError("Error al obtener sagas");
          return;
        }

        const data = await response.json();
        console.log("Respuesta de la API: ", data);

        if (Array.isArray(data)) {
          setSagas(data);
        } else {
          console.error("Los datos no son un array válido:", data);
          setError("Los datos no son un array válido");
        }
      } catch (error) {
        setError("Error al obtener sagas");
        console.error("Error al obtener sagas:", error);
      }
    };

    fetchSagas();
  }, []);

  useEffect(() => {
    console.log(
      `Saga seleccionada en Sagas: ${
        selectedSaga ? selectedSaga.saga : "Ninguna"
      }`
    ); // Añadido para depuración
  }, [selectedSaga]);

  const handleBookClick = (book) => {
    setSelectedBook(book);
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
          <div className={style.containerCard}>
            <CardBook book={selectedBook} />
          </div>
        </>
      )}
    </div>
  );
};

export default Sagas;
