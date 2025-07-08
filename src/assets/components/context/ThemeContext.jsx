import { createContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// Exportar el contexto para que pueda ser usado por el hook
export { ThemeContext };

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light"); // Tema por defecto
  const [isLoading, setIsLoading] = useState(true);

  // Cargar tema desde localStorage al inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const userTheme = localStorage.getItem("userTheme");

    // Priorizar el tema del usuario si existe, sino usar el tema guardado
    const themeToUse = userTheme || savedTheme || "light";

    setTheme(themeToUse);
    applyTheme(themeToUse);
    setIsLoading(false);
  }, []);

  // Aplicar tema al documento
  const applyTheme = (newTheme) => {
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

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
