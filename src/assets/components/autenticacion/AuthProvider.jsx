// AuthProvider.js
import { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');

  const login = (token) => {
    setIsAuthenticated(true);
    setToken(token);
    // Guarda el token en localStorage o en una cookie si es necesario
    localStorage.setItem('authToken', token); // Ejemplo de almacenamiento
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken('');
    // Elimina el token de localStorage o cookie si es necesario
    localStorage.removeItem('authToken'); // Ejemplo de eliminación
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};
