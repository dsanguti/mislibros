import { useState } from "react";
import styles from "../../css/Login.module.css"; // Importa el CSS módulo
import { useAuth } from "../autenticacion/UseAuth"; // Asegúrate de que la ruta sea correcta


const Login = () => {
  const { login } = useAuth(); // Usar el hook de autenticación
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      console.log("Respuesta del servidor:", response);

      const data = await response.json();
      console.log("Datos recibidos del backend:", data);

      if (data.status === "success") {
        // Autenticación exitosa
        console.log("Autenticación exitosa, usuario:", data);
        login(data.token || "token-placeholder"); // Cambia si en el futuro usas un token real
        setError(""); // Resetea el error si hay autenticación exitosa
      } else {
        // Error en las credenciales
        console.error("Error: Credenciales incorrectas.");
        setError("Credenciales incorrectas. Inténtalo de nuevo.");
      }
    } catch (error) {
      setError("Error en la autenticación. Inténtalo de nuevo más tarde.");
      console.error("Error en el login:", error);
    }
  };

  return (
    <div className={styles.container}>
      <img src="../../../../public/logoAppColor.png" alt="logo app"  className={styles.logo}/>
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
        {error && <p className={styles.error}>{error}</p>} {/* Mostrar error */}
        <button type="submit" className={styles.button}>
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default Login;
