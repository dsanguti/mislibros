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

    try {
      const response = await fetch("http://localhost:8001/api/update_saga", {
        method: "PUT",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Error desconocido", { autoClose: 3000 });
        return;
      }

      toast.success("Saga actualizada correctamente.", { autoClose: 1000 });

      if (typeof onUpdate === "function") onUpdate();
      setTimeout(() => {
        if (typeof onClose === "function") onClose();
      }, 2000);
    } catch {
      toast.error("Hubo un problema al actualizar la saga.", {
        autoClose: 3000,
      });
    }
  };

  return (
    <div className={style.formContainer}>
      <h2>Editar Saga</h2>

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

        <button className={style.buttonFormEdit} type="submit">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default EditSagaForm;
