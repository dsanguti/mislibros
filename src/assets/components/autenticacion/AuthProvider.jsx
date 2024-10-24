// AuthProvider.js
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true); //Estado de carga para verificar autenticación
  const navigate = useNavigate(); //usar useNavigate para redirigir

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setIsAuthenticated(true);
      setToken(storedToken);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false); // Finaliza la verficación
  }, []); // Se ejecuta solo una vez al montar el componente

  const login = (token) => {
    setIsAuthenticated(true);
    setToken(token);
    // Guarda el token en localStorage o en una cookie si es necesario
    localStorage.setItem("authToken", token); // Ejemplo de almacenamiento
    // Redirigir a la página de inicio después de iniciar sesión
    navigate("/"); // Redirige a la ruta raíz (Home)
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken("");
    // Elimina el token de localStorage o cookie si es necesario
    localStorage.removeItem("authToken"); // Ejemplo de eliminación
    navigate("/login"); //redirigir a pantalla de inicio
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, token, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
