import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../../css/Login.module.css";
import { API_ENDPOINTS } from "../../../config/api";

const ForgotPasswordForm = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor, introduce tu email");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        API_ENDPOINTS.FORGOT_PASSWORD,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Se ha enviado un email con instrucciones para recuperar tu contraseña"
        );
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast.error(data.error || "Error al enviar el email de recuperación");
      }
    } catch (error) {
      console.error("Error en recuperación de contraseña:", error);
      toast.error("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Recuperar Contraseña</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.forgotPasswordContent}>
          <p>
            Introduce tu dirección de email y te enviaremos instrucciones para
            restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
