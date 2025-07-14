import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../../css/Login.module.css";
import { API_ENDPOINTS } from "../../../config/api";

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Obtener el token de la URL
  const token = searchParams.get("token");

  useEffect(() => {
    // Si no hay token, redirigir al login
    if (!token) {
      toast.error("Enlace de recuperación inválido");
      navigate("/login");
    }
  }, [token, navigate]);

  // Función de validación de contraseña (igual que en AddUserForm)
  const validatePassword = (password) => {
    if (!password) return []; // Si no hay contraseña, no mostrar errores

    const errors = [];

    if (password.length < 8) {
      errors.push("La contraseña debe tener al menos 8 caracteres");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Debe contener al menos una mayúscula");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Debe contener al menos una minúscula");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Debe contener al menos un número");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Debe contener al menos un carácter especial");
    }

    return errors;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Validar contraseña en tiempo real
    const errors = validatePassword(newPassword);
    setPasswordError(errors.length > 0 ? errors.join(", ") : "");
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Por favor, completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    // Validar contraseña usando la función de validación
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      toast.error(passwordErrors[0]); // Mostrar el primer error
      return;
    }

    setIsSubmitting(true);

    console.log("Enviando datos:", {
      token: token ? "PRESENTE" : "AUSENTE",
      password: password ? "PRESENTE" : "AUSENTE",
    });

    try {
      const response = await fetch(API_ENDPOINTS.RESET_PASSWORD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Contraseña actualizada correctamente");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(data.error || "Error al cambiar la contraseña");
      }
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      toast.error("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/login");
  };

  if (!token) {
    return null; // No mostrar nada mientras se redirige
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Cambiar Contraseña</h2>
        </div>

        <div className={styles.forgotPasswordContent}>
          <p>
            Introduce tu nueva contraseña. Asegúrate de que sea segura y fácil
            de recordar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.passwordContainer}>
            <label htmlFor="password">Nueva contraseña</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={password}
              onChange={handlePasswordChange}
              required
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.passwordToggle}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          {password && passwordError && (
            <div className={styles.errorMessage}>{passwordError}</div>
          )}

          <div className={styles.passwordContainer}>
            <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={styles.passwordToggle}
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          <div className={styles.buttonContainer}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.buttonCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.button}
              disabled={isSubmitting || passwordError !== ""}
            >
              {isSubmitting ? "Cambiando..." : "Cambiar Contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
