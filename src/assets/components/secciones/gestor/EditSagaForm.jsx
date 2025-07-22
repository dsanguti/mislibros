import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_ENDPOINTS } from "../../../../config/api";
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
    console.log("🚀 handleSubmit ejecutándose...");
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("No tienes permiso para actualizar la saga.", {
        autoClose: 3000,
      });
      return;
    }

    const data = new FormData();
    data.append("id", Number(formData.id));
    data.append("nombre", formData.nombre);
    if (file) data.append("coverSaga", file);

    // Debug logs
    console.log("🔍 URL de actualización:", API_ENDPOINTS.UPDATE_SAGA);
    console.log("🔍 Datos del formulario:", {
      id: formData.id,
      nombre: formData.nombre,
      tieneArchivo: !!file,
    });

    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_SAGA, {
        method: "PUT",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🔍 Respuesta del servidor:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error en la respuesta:", errorText);
        throw new Error("Error al actualizar la saga");
      }

      const data = await response.json();
      const updatedSaga = {
        id: data.id,
        nombre: data.nombre,
        coverSaga: data.coverSaga,
      };

      // Disparar evento de actualización
      window.dispatchEvent(new Event("sagaUpdated"));

      onUpdate(updatedSaga);
      setFormData({
        id: data.id,
        nombre: data.nombre,
        coverSaga: data.coverSaga,
      });
      setPreview(data.coverSaga);
      setFile(null);
      toast.success("Saga actualizada correctamente", { autoClose: 2000 });
      setTimeout(() => {
        if (typeof onClose === "function") onClose();
      }, 2000);
    } catch (error) {
      console.error("❌ Error completo:", error);
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
          <button
            className={style.buttonFormEdit}
            type="submit"
            onClick={() => console.log("🖱️ Botón Guardar Cambios clickeado")}
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSagaForm;
