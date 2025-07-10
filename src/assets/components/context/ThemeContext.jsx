import { createContext, useCallback, useEffect, useState } from "react";

const ThemeContext = createContext();

// Exportar el contexto para que pueda ser usado por el hook
export { ThemeContext };

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light"); // Tema por defecto
  const [isLoading, setIsLoading] = useState(true);

  // Aplicar tema al documento
  const applyTheme = useCallback((newTheme) => {
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }, []);

  // Función para cargar y aplicar el tema
  const loadAndApplyTheme = useCallback(() => {
    const savedTheme = localStorage.getItem("theme");
    const userTheme = localStorage.getItem("userTheme");

    // Priorizar el tema del usuario si existe, sino usar el tema guardado
    const themeToUse = userTheme || savedTheme || "light";

    console.log("ThemeContext - Aplicando tema:", themeToUse);
    setTheme(themeToUse);
    applyTheme(themeToUse);
  }, [applyTheme]);

  // Cargar tema desde localStorage al inicializar
  useEffect(() => {
    loadAndApplyTheme();
    setIsLoading(false);
  }, [loadAndApplyTheme]);

  // Escuchar cambios en localStorage para sincronizar con AuthProvider
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "userTheme") {
        console.log(
          "ThemeContext - userTheme cambiado en localStorage:",
          e.newValue
        );
        loadAndApplyTheme();
      }
    };

    // Escuchar cambios en localStorage (entre tabs)
    window.addEventListener("storage", handleStorageChange);

    // Escuchar evento personalizado para cambios locales
    const handleUserThemeChange = () => {
      console.log("ThemeContext - Evento userThemeChange recibido");
      loadAndApplyTheme();
    };

    window.addEventListener("userThemeChange", handleUserThemeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userThemeChange", handleUserThemeChange);
    };
  }, [loadAndApplyTheme]);

  // Cambiar tema
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Establecer tema específico
  const setThemeMode = (newTheme) => {
    if (newTheme === "light" || newTheme === "dark") {
      setTheme(newTheme);
      applyTheme(newTheme);
    }
  };

  // Guardar preferencia de tema del usuario
  const saveUserThemePreference = (userTheme) => {
    localStorage.setItem("userTheme", userTheme);
    // Disparar evento personalizado para notificar el cambio
    window.dispatchEvent(new CustomEvent("userThemeChange"));
    setThemeMode(userTheme);
  };

  // Obtener tema actual
  const getCurrentTheme = () => theme;

  // Verificar si está en modo oscuro
  const isDarkMode = () => theme === "dark";

  const value = {
    theme,
    isLoading,
    toggleTheme,
    setThemeMode,
    saveUserThemePreference,
    getCurrentTheme,
    isDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
