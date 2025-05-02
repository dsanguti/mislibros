import { useEffect, useState } from "react";
import style from "../../../css/Sagas.module.css";
import BooksListRow from "../../BooksListRow";
import HeaderRow from "../../HeaderRow";

const MainGenero = ({ genero, onBookClick }) => {
  console.log("📥 Prop recibida en MainGenero:", genero);
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!genero) return;

    const fetchLibros = async () => {
      setLoading(true);
      setError(null);

      try {
        const authToken = localStorage.getItem("authToken");
        console.log("Token de autenticación:", authToken);

        if (!authToken) {
          setError("No se encontró el token de autenticación");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:8001/api/libros-genero?genero=${encodeURIComponent(genero.nombre)}`,
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
  }, [genero]);

  return (
    <div className={style.mainSagaContainer}>
      <h4 className={style.tittle}>Género: {genero ? genero.nombre : "Selecciona un género"}</h4>
      {genero && (
        <div className={style.containerListBooks}>
          <HeaderRow />
          <BooksListRow books={libros} error={error} loading={loading} onBookClick={onBookClick} />
        </div>
      )}
    </div>
  );
};

export default MainGenero;
