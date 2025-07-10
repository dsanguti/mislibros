// AuthProvider.js
import { createContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

// Singleton para el estado de autenticación
class AuthStateManager {
  constructor() {
    this.state = {
      isAuthenticated: false,
      token: "",
      user: null,
      loading: true,
    };
    this.listeners = [];
    this.initialized = false;
  }

  getState() {
    return { ...this.state };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    console.log("AuthStateManager - Estado actualizado:", this.state);
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Cargar desde localStorage
  loadFromStorage() {
    if (this.initialized) {
      console.log(
        "AuthStateManager - Ya inicializado, retornando estado actual"
      );
      return this.state;
    }

    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    console.log("AuthStateManager - Cargando desde localStorage");
    console.log("Token:", storedToken ? "PRESENTE" : "AUSENTE");
    console.log("User:", storedUser ? "PRESENTE" : "AUSENTE");

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        this.setState({
          isAuthenticated: true,
          token: storedToken,
          user: userData,
          loading: false,
        });
        console.log("AuthStateManager - Datos cargados exitosamente");
        this.initialized = true;
        return this.state;
      } catch (error) {
        console.error("AuthStateManager - Error al cargar datos:", error);
      }
    }

    this.setState({
      isAuthenticated: false,
      token: "",
      user: null,
      loading: false,
    });
    this.initialized = true;
    return this.state;
  }

  // Actualizar usuario
  updateUser(newUserData) {
    console.log("AuthStateManager - Actualizando usuario:", newUserData);
    this.setState({
      user: newUserData,
      isAuthenticated: true, // Asegurar que permanezca autenticado
    });
    localStorage.setItem("user", JSON.stringify(newUserData));
  }

  // Login
  login(token, userData) {
    console.log("AuthStateManager - Login:", userData);
    this.setState({
      isAuthenticated: true,
      token,
      user: userData,
      loading: false,
    });
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  }

  // Logout
  logout() {
    console.log("AuthStateManager - Logout");
    this.setState({
      isAuthenticated: false,
      token: "",
      user: null,
      loading: false,
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

// Instancia global
const authStateManager = new AuthStateManager();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    // Inicializar con el estado del singleton
    const initialState = authStateManager.loadFromStorage();
    console.log("AuthProvider - Estado inicial:", initialState);
    return initialState;
  });

  const navigate = useNavigate();
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));

  console.log("AuthProvider instancia:", instanceId.current);

  // Suscribirse a cambios del singleton
  useEffect(() => {
    console.log("AuthProvider - Suscribiéndose a cambios");
    const unsubscribe = authStateManager.subscribe((newState) => {
      console.log(
        "AuthProvider - Estado actualizado desde singleton:",
        newState
      );
      setAuthState(newState);
    });

    return unsubscribe;
  }, []);

  const login = (token, userData) => {
    console.log("AuthProvider - Login llamado");
    authStateManager.login(token, userData);

    // Aplicar el tema del usuario si existe
    if (userData.theme) {
      console.log("AuthProvider - Aplicando tema del usuario:", userData.theme);
      // Guardar el tema en localStorage para que el ThemeProvider lo cargue
      localStorage.setItem("userTheme", userData.theme);
      // Disparar evento personalizado para notificar al ThemeProvider
      window.dispatchEvent(new CustomEvent("userThemeChange"));
    }

    navigate("/");
  };

  const logout = () => {
    console.log("AuthProvider - Logout llamado");
    authStateManager.logout();
    navigate("/login");
  };

  const updateUser = (newUserData) => {
    console.log("AuthProvider - UpdateUser llamado:", newUserData);
    authStateManager.updateUser(newUserData);

    // Si el tema del usuario cambió, notificar al ThemeProvider
    if (newUserData.theme) {
      console.log("AuthProvider - Tema actualizado:", newUserData.theme);
      localStorage.setItem("userTheme", newUserData.theme);
      // Disparar evento personalizado para notificar al ThemeProvider
      window.dispatchEvent(new CustomEvent("userThemeChange"));
    }
  };

  console.log("=== AuthProvider render ===");
  console.log("Estado actual:", {
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    user: authState.user ? "PRESENTE" : "AUSENTE",
  });

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        login,
        logout,
        token: authState.token,
        loading: authState.loading,
        user: authState.user,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
