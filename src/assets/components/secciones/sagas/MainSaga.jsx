import { useEffect, useState } from "react";
import style from "../../../css/Sagas.module.css";
import BooksListRow from "../../BooksListRow";
import HeaderRow from "../../HeaderRow";

const MainSaga = ({ saga, onBookClick }) => {
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!saga) return;

    const fetchLibros = async () => {
      setLoading(true);
      setError(null);

      try {
        const authToken = localStorage.getItem("token");
        console.log("Token de autenticación:", authToken);

        if (!authToken) {
          setError("No se encontró el token de autenticación");
          setLoading(false);
          return;
        }
        console.log("ID de la saga al hacer clic:", saga.id); //
        const response = await fetch(
          `http://localhost:8001/api/libros-sagas?sagaId=${saga.id}`,

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
          console.error("Error en la solicitud:", errorData);
          setError("Error al obtener libros");
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Respuesta de la API: ", data);

        if (Array.isArray(data)) {
          setLibros(data);
        } else {
          console.error("Los datos no son un array válido:", data);
          setError("Los datos no son un array válido");
        }
      } catch (error) {
        setError("Error al obtener libros");
        console.error("Error al obtener libros:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibros();
  }, [saga]);

  return (
    <div className={style.mainSagaContainer}>
      <h4 className={style.tittle}>
        Saga: {saga ? saga.nombre : "Selecciona una saga"}
      </h4>
      {saga && (
        <>
          <div className={style.containerListBooks}>
            <HeaderRow />
            <BooksListRow
              books={libros}
              error={error}
              loading={loading}
              onBookClick={onBookClick}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MainSaga;
