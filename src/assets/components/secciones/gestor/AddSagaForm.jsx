import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../../../css/Gestor.module.css";
import { useAuth } from "../../autenticacion/UseAuth";

const AddSagaForm = ({ onClose, onUpdate }) => {
  const [nombre, setNombre] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  // Función para manejar el cambio de archivo de imagen
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificar que sea una imagen
      if (!file.type.startsWith("image/")) {
        setError("Por favor, selecciona un archivo de imagen válido");
        return;
      }

      setCoverFile(file);

      // Crear una vista previa de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setError("El nombre de la saga es obligatorio");
      return;
    }

    setLoading(true);

    try {
      // Crear un FormData para enviar tanto el nombre como la imagen
      const formData = new FormData();
      formData.append("nombre", nombre);

      // Añadir la imagen si existe
      if (coverFile) {
        formData.append("cover", coverFile);
      }

      const response = await fetch("http://localhost:8001/api/create_saga", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al crear la saga");
      }

      const data = await response.json();
      const newSaga = {
        id: data.id,
        nombre: data.nombre,
        coverSaga: data.coverSaga,
      };

      // Disparar evento de actualización
      window.dispatchEvent(new Event("sagaUpdated"));

      onUpdate(newSaga);
      setNombre("");
      setCoverFile(null);
      setCoverPreview(null);
      toast.success("Saga creada correctamente", { autoClose: 2000 });

      // Cerrar el formulario después de crear la saga
      if (typeof onClose === "function") {
        onClose();
      }
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

        <div className={styles.coverSection}>
          <label className={styles.labelForm}>Carátula de la Saga:</label>
          <div className={styles.coverContainer}>
            {coverPreview && (
              <div className={styles.coverPreviewContainer}>
                <img
                  src={coverPreview}
                  alt="Vista previa de la carátula"
                  className={styles.coverPreview}
                />
              </div>
            )}
            <div className={styles.coverInputContainer}>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className={styles.coverInput}
              />
              <p className={styles.coverHelp}>
                Selecciona una imagen para la carátula de la saga
              </p>
            </div>
          </div>
        </div>

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
