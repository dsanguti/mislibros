import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from "../../../css/Gestor.module.css";

const EditSagaForm = ({ saga, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    id: saga.id,
    nombre: saga.nombre,
    coverSaga: saga.coverSaga,
  });

  const [preview, setPreview] = useState(saga.coverSaga);
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const imageUrl = URL.createObjectURL(selectedFile);
      setPreview(imageUrl);
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    console.log("INICIO handleSubmit");
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("No tienes permiso para actualizar la saga.", {
        autoClose: 3000,
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("id", Number(formData.id));
    formDataToSend.append("nombre", formData.nombre);
    if (file) formDataToSend.append("coverSaga", file);

    try {
      const response = await fetch(
        "https://mislibros-production.up.railway.app/api/update_saga",
        {
          method: "PUT",
          body: formDataToSend,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar la saga");
      }

      const result = await response.json();

      // Disparar evento de actualización
      window.dispatchEvent(new Event("sagaUpdated"));

      onUpdate(result);
      setFormData({
        id: result.id,
        nombre: result.nombre,
        coverSaga: result.coverSaga,
      });
      setPreview(result.coverSaga);
      setFile(null);
      toast.success("Saga actualizada correctamente", { autoClose: 2000 });
      setTimeout(() => {
        if (typeof onClose === "function") onClose();
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar saga:", error);
      toast.error("Hubo un problema al actualizar la saga.", {
        autoClose: 3000,
      });
    }
  };

  return (
    <div className={style.formContainer}>
      <h2 className={style.myTittleForm}>Editar Saga</h2>

      <form className={style.formEdit} onSubmit={handleSubmit}>
        <label className={style.labelForm}>Carátula:</label>
        <div className={style.containerCoverPreview}>
          {preview && (
            <img
              src={preview}
              alt="Vista previa"
              className={style.coverPreview}
            />
          )}
        </div>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <label className={style.labelForm}>Nombre:</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
        />
        <div className={style.buttonContainerEditSaga}>
          <button
            className={style.buttonFormCancel}
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button className={style.buttonFormEdit} type="submit">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSagaForm;
