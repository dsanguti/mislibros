import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../../css/Login.module.css";
import EyesClosed from "../icons/EyesClosed";
import EyesOpen from "../icons/EyesOpen";

const RegisterForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    user: "",
    password: "",
    name: "",
    lastname: "",
    mail: "",
    profile: "Consulta", // Perfil fijo en "Consulta"
  });

  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = (password) => {
    if (!password) return [];

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "password") {
      const errors = validatePassword(value);
      setPasswordError(errors.length > 0 ? errors.join(", ") : "");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordError) {
      toast.error("La contraseña no cumple con los requisitos de seguridad");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8001/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Error al crear el usuario");
        return;
      }

      toast.success(
        "Usuario registrado correctamente. Revisa tu email para verificar tu cuenta."
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al crear usuario:", error);
      toast.error("Hubo un problema al crear el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Crear Nuevo Usuario</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="user"
            placeholder="Usuario"
            value={formData.user}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <div className={styles.passwordInputContainer}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
              className={styles.input}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={styles.togglePasswordButton}
            >
              {showPassword ? <EyesOpen /> : <EyesClosed />}
            </button>
          </div>
          {passwordError && (
            <div className={styles.errorMessage}>{passwordError}</div>
          )}

          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={formData.name}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <input
            type="text"
            name="lastname"
            placeholder="Apellido"
            value={formData.lastname}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <input
            type="email"
            name="mail"
            placeholder="Email"
            value={formData.mail}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <div className={styles.buttonContainer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.buttonCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.button}
              disabled={isSubmitting || passwordError}
            >
              {isSubmitting ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
