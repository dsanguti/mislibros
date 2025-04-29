import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../autenticacion/UseAuth";
import styles from "../../../css/Gestor.module.css";

const AddSagaForm = ({ onClose, onUpdate }) => {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setError("El nombre de la saga es obligatorio");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8001/api/create_saga", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la saga");
      }

      toast.success("Saga creada con éxito");
      if (onUpdate) onUpdate();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Añadir Nueva Saga</h2>
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.formEdit}>
        <label className={styles.labelForm}>
          Nombre de la Saga:
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={styles.inputFormEdit}
            placeholder="Introduce el nombre de la saga"
            required
          />
        </label>

        <button
          type="submit"
          className={styles.buttonFormEdit}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar Saga"}
        </button>
      </form>
    </div>
  );
};

export default AddSagaForm;
