// AuthProvider.js
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const decodeToken = (token) => {
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
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      const userData = decodeToken(storedToken);
      if (userData) {
        setIsAuthenticated(true);
        setToken(storedToken);
        setUser(userData);
        console.log("Usuario decodificado:", userData); // Para depuración
      } else {
        // Si el token no se puede decodificar, limpiar todo
        setIsAuthenticated(false);
        setToken("");
        setUser(null);
        localStorage.removeItem("authToken");
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    const userData = decodeToken(token);
    if (userData) {
      setIsAuthenticated(true);
      setToken(token);
      setUser(userData);
      localStorage.setItem("authToken", token);
      console.log("Usuario logueado:", userData); // Para depuración
      navigate("/");
    } else {
      console.error("Error al decodificar el token durante el login");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken("");
    setUser(null);
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, token, loading, user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
