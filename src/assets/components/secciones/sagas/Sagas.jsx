import { useState, useEffect } from "react";
import style from "../../../css/Sagas.module.css";
import HeaderSaga from "./HeaderSaga";

const Sagas = () => {
  const [sagas, setSagas] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSagas = async () => {
      try {
        // Verificar si el token está presente en el localStorage
        const authToken = localStorage.getItem("authToken");
        console.log("Token de autenticación:", authToken);

        if (!authToken) {
          setError("No se encontró el token de autenticación");
          return;
        }

        const response = await fetch(
          "http://localhost/backendMisLibros/api/sagas.php?sagas=true",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

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
  }, []); // Solo se ejecuta una vez cuando el componente se monta

  return (
    <div className={style.container}>
      <div className={style.header}>
        <HeaderSaga sagas={sagas} error={error} />
      </div>
      <div className={style.main}>
        <h1>main</h1>
      </div>
    </div>
  );
};

export default Sagas;
