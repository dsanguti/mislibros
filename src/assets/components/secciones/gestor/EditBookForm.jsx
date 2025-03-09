import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from "../../../css/Gestor.module.css";

const EditBookForm = ({ book, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    id: book.id,
    titulo: book.titulo,
    autor: book.autor,
    genero: book.genero,
    sinopsis: book.sinopsis,
    cover: book.cover,
  });

  const [preview, setPreview] = useState(book.cover);
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
      toast.error("No tienes permiso para actualizar el libro.", { autoClose: 3000 });
      return;
    }

    const data = new FormData();
    data.append("id", book.id);
    data.append("titulo", formData.titulo);
    data.append("autor", formData.autor);
    data.append("genero", formData.genero);
    data.append("sinopsis", formData.sinopsis);
    if (file) {
      data.append("cover", file);
    }

    try {
      const response = await fetch("http://localhost:8001/api/update_book", {
        method: "PUT",
        body: data,
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Error desconocido", { autoClose: 3000 });
        return;
      }

      toast.success("Libro actualizado correctamente.", { autoClose: 2000 });

      if (typeof onUpdate === "function") {
        onUpdate();
      }

      setTimeout(() => {
        if (typeof onClose === "function") {
          onClose();
        }
      }, 2000);
      
    } catch {
      toast.error("Hubo un problema al actualizar el libro.", { autoClose: 3000 });
    }
  };

  return (
    <div className={style.formContainer}>
      <h2>Editar Libro</h2>

      <form className={style.formEdit} onSubmit={handleSubmit}>
        <label className={style.labelForm}>Carátula:</label>
        <div className={style.containerCoverPreview}>
          {preview && <img src={preview} alt="Vista previa" className={style.coverPreview} />}
        </div>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <label className={style.labelForm}>Título:</label>
        <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} />

        <label className={style.labelForm}>Autor:</label>
        <input type="text" name="autor" value={formData.autor} onChange={handleChange} />

        <label className={style.labelForm}>Género:</label>
        <input type="text" name="genero" value={formData.genero} onChange={handleChange} />

        <label className={style.labelForm}>Sinopsis:</label>
        <textarea name="sinopsis" value={formData.sinopsis} onChange={handleChange} rows="5" />

        <button className={style.buttonFormEdit} type="submit">Guardar Cambios</button>
      </form>
    </div>
  );
};

export default EditBookForm;


