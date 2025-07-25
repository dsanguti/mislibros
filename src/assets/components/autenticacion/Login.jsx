import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Para redirigir al inicio después del login
import styles from "../../css/Login.module.css"; // Importa el CSS módulo
import { useAuth } from "../autenticacion/UseAuth"; // Hook de autenticación
import CargaApp from "../CargaApp";
import { useTheme } from "../hooks/useTheme";
import ForgotPasswordForm from "./ForgotPasswordForm";
import RegisterForm from "./RegisterForm";
import { API_ENDPOINTS } from "../../../config/api";

const Login = () => {
  const { login } = useAuth(); // Usar el hook de autenticación
  const { getCurrentTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [containerHeight, setContainerHeight] = useState("240px"); // Altura por defecto
  const [loading, setLoading] = useState(false); // Estado de carga
  const [isVisible, setIsVisible] = useState(true); // Estado de visibilidad del contenedor
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);
  const navigate = useNavigate(); // Hook para redirigir

  const currentTheme = getCurrentTheme();
  const logoSrc =
    currentTheme === "dark" ? "/logoAppColorDark.png" : "/logoAppColor.png";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Enviando datos de login:", { user: username, password });
      const response = await fetch(
        API_ENDPOINTS.LOGIN, // Asegúrate de usar el puerto correcto
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user: username, password }),
          credentials: "include", // Esto es necesario para que las cookies se envíen
        }
      );

      // Asegúrate de que la respuesta sea OK
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status}`);
      }

      const data = await response.json();
      console.log("Datos recibidos del backend:", data);

      if (data.message === "Inicio de sesión exitoso") {
        console.log("Autenticación exitosa, usuario:", data);
        setError("");
        setContainerHeight("240px");

        // Mostrar CargaApp y ocultar el formulario
        setLoading(true); // Activar el estado de carga
        setIsVisible(false); // Ocultar el contenedor

        // Guardar el token y usuario en localStorage
        localStorage.setItem("token", data.token); // Guardamos el token
        localStorage.setItem("user", JSON.stringify(data.user)); // Guardamos el usuario

        setTimeout(() => {
          login(data.token, data.user); // Pasar tanto el token como los datos del usuario
          navigate("/"); // Redirigir al inicio después de mostrar CargaApp
        }, 970); // Tiempo que CargaApp estará visible
      } else {
        console.error("Error: Credenciales incorrectas.");
        setError("Credenciales incorrectas. Inténtalo de nuevo.");
        setContainerHeight("280px");
      }
    } catch (error) {
      // Intentar parsear el error para ver si es un usuario no verificado
      try {
        const errorResponse = await error.response?.json();
        if (errorResponse?.needsVerification) {
          setError(
            "Cuenta no verificada. Por favor, verifica tu email antes de iniciar sesión."
          );
        } else {
          setError("Error en la autenticación. Inténtalo de nuevo más tarde.");
        }
      } catch {
        setError("Error en la autenticación. Inténtalo de nuevo más tarde.");
      }
      console.error("Error en el login:", error);
      setContainerHeight("280px");
    }
  };

  const handleRegisterSuccess = () => {
    setError("");
    setContainerHeight("240px");
  };

  return (
    <>
      <div className={styles.containerLogin}>
        <div>
          {loading && <CargaApp />}
          <div
            className={`${styles.container} ${!isVisible ? styles.hidden : ""}`}
            style={{
              height: containerHeight,
              opacity: isVisible ? 1 : 0, // Transición de opacidad
              transition: "height 0.3s ease, opacity 0.3s ease", // Duración de la transición de altura y opacidad
            }}
          >
            <img src={logoSrc} alt="logo app" className={styles.logo} />
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

            {/* Enlaces adicionales */}
            <div className={styles.additionalLinks}>
              <button
                type="button"
                onClick={() => setShowRegisterForm(true)}
                className={styles.linkButton}
              >
                Crear nuevo usuario
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPasswordForm(true)}
                className={styles.linkButton}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de registro */}
      {showRegisterForm && (
        <RegisterForm
          onClose={() => setShowRegisterForm(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}

      {/* Modal de recuperación de contraseña */}
      {showForgotPasswordForm && (
        <ForgotPasswordForm onClose={() => setShowForgotPasswordForm(false)} />
      )}
    </>
  );
};

export default Login;
