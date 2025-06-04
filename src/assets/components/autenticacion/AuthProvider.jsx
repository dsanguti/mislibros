// AuthProvider.js
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); //Estado de carga para verificar autenticación
  const navigate = useNavigate(); //usar useNavigate para redirigir

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setIsAuthenticated(true);
      setToken(storedToken);
      // Decodificar el token para obtener la información del usuario
      try {
        const base64Url = storedToken.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        const userData = JSON.parse(jsonPayload);
        setUser(userData);
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false); // Finaliza la verficación
  }, []); // Se ejecuta solo una vez al montar el componente

  const login = (token) => {
    setIsAuthenticated(true);
    setToken(token);
    // Decodificar el token para obtener la información del usuario
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      const userData = JSON.parse(jsonPayload);
      setUser(userData);
    } catch (error) {
      console.error("Error al decodificar el token:", error);
    }
    // Guarda el token en localStorage o en una cookie si es necesario
    localStorage.setItem("token", token); // Ejemplo de almacenamiento
    // Redirigir a la página de inicio después de iniciar sesión
    navigate("/"); // Redirige a la ruta raíz (Home)
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken("");
    setUser(null);
    // Elimina el token de localStorage o cookie si es necesario
    localStorage.removeItem("token"); // Ejemplo de eliminación
    navigate("/login"); //redirigir a pantalla de inicio
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, token, loading, user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
