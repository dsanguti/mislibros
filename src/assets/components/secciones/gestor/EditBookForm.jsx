import { useState } from "react";
import style from "../../../css/Gestor.module.css";

const EditBookForm = ({ book, onClose }) => {
  const [formData, setFormData] = useState({
    titulo: book.titulo,
    autor: book.autor,
    genero: book.genero, 
    sinopsis: book.sinopsis, 
    cover: book.cover,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos editados:", formData);
    onClose(); // Cerrar modal después de editar
  };

  return (
    <div className={style.formContainer}>
      <h2>Editar Libro</h2>
      <form className={style.formEdit} onSubmit={handleSubmit}>
        
        <label className={style.labelForm}>Carátula:</label>
        <input className={style.inputFormEdit} type="text" name="cover" value={formData.cover} onChange={handleChange} />

        <label className={style.labelForm}>Título:</label>
        <input className={style.inputFormEdit} type="text" name="titulo" value={formData.titulo} onChange={handleChange} />

        <label className={style.labelForm}>Autor:</label>
        <input className={style.inputFormEdit} type="text" name="autor" value={formData.autor} onChange={handleChange} />

        <label className={style.labelForm}>Género:</label>
        <input className={style.inputFormEdit} type="text" name="genero" value={formData.genero} onChange={handleChange} />

        <label className={style.labelForm}>Sinopsis:</label>
        <input className={style.inputFormEdit} type="text" name="sinopsis" value={formData.sinopsis} onChange={handleChange} />

        <button className={style.buttonFormEdit} type="submit">Guardar Cambios</button>
      </form>
    </div> 
  );
};

export default EditBookForm;
