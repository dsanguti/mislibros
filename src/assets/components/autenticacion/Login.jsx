import { useState } from "react";
import styles from "../../css/Login.module.css"; // Importa el CSS módulo
import { useAuth } from "../autenticacion/UseAuth";
import CargaApp from "../CargaApp";

const Login = () => {
  const { login } = useAuth(); // Usar el hook de autenticación
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [containerHeight, setContainerHeight] = useState("240px"); // Altura por defecto
  const [loading, setLoading] = useState(false); // Estado de carga
  const [isVisible, setIsVisible] = useState(true); // Estado de visibilidad del contenedor

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Activar el estado de carga
    setError("");

    try {
      console.log("Enviando datos de login:", { user: username, password });
      const response = await fetch(
        "http://localhost/backendMisLibros/api/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user: username, password }),
        }
      );

      const data = await response.json();
      console.log("Datos recibidos del backend:", data);

      if (data.status === "success") {
        console.log("Autenticación exitosa, usuario:", data);
        setError("");
        setContainerHeight("240px");
        setIsVisible(false); // Ocultar el contenedor al autenticar
        setTimeout(() => {
          login(data.token || "token-placeholder");

          setLoading(false); // Desactivar el estado de carga después de redirigir
        }, 2330);
      } else {
        console.error("Error: Credenciales incorrectas.");
        setError("Credenciales incorrectas. Inténtalo de nuevo.");
        setContainerHeight("280px");
        setLoading(false);
      }
    } catch (error) {
      setError("Error en la autenticación. Inténtalo de nuevo más tarde.");
      console.error("Error en el login:", error);
      setContainerHeight("280px");
      setLoading(false);
    }
  };

 

  return (
    <div>
      {loading && <CargaApp />}
      {isVisible && ( // Solo renderizar el contenedor si es visible
        <div
          className={`${styles.container} ${!isVisible ? styles.hidden : ""}`}
          style={{ height: containerHeight }}
        >
          <img src="/logoAppColor.png" alt="logo app" className={styles.logo} />
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
            {error && (
              <p className={`${styles.error} ${styles.show}`}>{error}</p>
            )}
            <button type="submit" className={styles.button}>
              Iniciar Sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;
