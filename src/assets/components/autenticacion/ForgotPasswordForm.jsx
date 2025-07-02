import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../../css/Login.module.css";

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
      // Por ahora, solo mostraremos un mensaje informativo
      // En el futuro, aquí se implementaría la lógica de recuperación de contraseña
      toast.info(
        "Función de recuperación de contraseña en desarrollo. Contacta al administrador."
      );

      // Simular un delay para mostrar el estado de carga
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error en recuperación de contraseña:", error);
      toast.error("Hubo un problema al procesar la solicitud.");
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
              {isSubmitting ? "Enviando..." : "Enviar Instrucciones"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
