import { useEffect, useState } from "react";
import Carrusel from "../../Carrusel";

const HeaderSaga = () => {
  const [sagas, setSagas] = useState([]);

  useEffect(() => {
    const fetchSagas = async () => {
      try {
        const response = await fetch("http://localhost/backendMisLibros/api/libros.php?sagas=true");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data); // Verifica si `coverSaga` y `saga` están presentes en los datos
        setSagas(data);
      } catch (error) {
        console.error("Error al obtener sagas:", error);
      }
    };

    fetchSagas();
  }, []);

  return sagas.length > 0 ? <Carrusel sagas={sagas} /> : <p>Cargando sagas...</p>;
};

export default HeaderSaga;

