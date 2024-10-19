// useAuth.js
import { useContext } from 'react';
import { AuthContext } from './AuthProvider'; // Asegúrate de que la ruta sea correcta

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

