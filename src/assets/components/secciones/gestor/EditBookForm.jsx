import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from "../../../css/Gestor.module.css";

const EditBookForm = ({ book, onClose, onUpdate }) => {
  console.log("Libro completo recibido:", book);

  // Asegurarnos de que los valores sean números o booleanos
  const starwarsValue = book.starwars !== undefined ? Number(book.starwars) : 0;
  const comicsValue = book.comics !== undefined ? Number(book.comics) : 0;

  console.log("Valores procesados:", {
    starwarsValue,
    comicsValue,
    starwarsType: typeof starwarsValue,
    comicsType: typeof comicsValue,
  });

  const [formData, setFormData] = useState({
    id: book.id,
    titulo: book.titulo,
    autor: book.autor,
    id_genero: "", // se establecerá después
    saga_id: "", // se establecerá después
    sinopsis: book.sinopsis,
    cover: book.cover,
    starwars: starwarsValue === 1,
    comics: comicsValue === 1,
  });

  console.log("Estado inicial del formulario:", formData);

  const [preview, setPreview] = useState(book.cover);
  const [file, setFile] = useState(null);
  const [generos, setGeneros] = useState([]);
  const [sagas, setSagas] = useState([]);

  // Obtener géneros
  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8001/api/generoEnum", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Error al obtener los géneros");

        const data = await response.json();
        setGeneros(data);

        const generoMatch = data.find((g) => g.nombre === book.genero);
        if (generoMatch) {
          setFormData((prev) => ({ ...prev, id_genero: generoMatch.id }));
        }
      } catch {
        toast.error("Hubo un problema al obtener los géneros.", {
          autoClose: 3000,
        });
      }
    };

    fetchGeneros();
  }, [book.genero]);

  // Obtener sagas
  useEffect(() => {
    const fetchSagas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8001/api/sagas", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Error al obtener las sagas");

        const data = await response.json();
        setSagas(data);

        const sagaMatch = data.find((s) => s.nombre === book.saga);
        if (sagaMatch) {
          setFormData((prev) => ({ ...prev, saga_id: sagaMatch.id }));
        }
      } catch {
        toast.error("Hubo un problema al obtener las sagas.", {
          autoClose: 3000,
        });
      }
    };

    fetchSagas();
  }, [book.saga]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log("Cambio en checkbox:", { name, value, type, checked });
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
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
      toast.error("No tienes permiso para actualizar el libro.", {
        autoClose: 3000,
      });
      return;
    }

    console.log("Enviando datos:", {
      starwars: formData.starwars,
      comics: formData.comics,
    });

    const data = new FormData();
    data.append("id", Number(formData.id));
    data.append("titulo", formData.titulo);
    data.append("autor", formData.autor);
    data.append("id_genero", Number(formData.id_genero));
    data.append("saga_id", formData.saga_id ? Number(formData.saga_id) : "");
    data.append("sinopsis", formData.sinopsis);
    data.append("starwars", formData.starwars ? "1" : "0");
    data.append("comics", formData.comics ? "1" : "0");
    if (file) data.append("cover", file);

    try {
      const response = await fetch("http://localhost:8001/api/update_book", {
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

      toast.success("Libro actualizado correctamente.", { autoClose: 1000 });

      if (typeof onUpdate === "function") onUpdate();
      setTimeout(() => {
        if (typeof onClose === "function") onClose();
      }, 2000);
    } catch {
      toast.error("Hubo un problema al actualizar el libro.", {
        autoClose: 3000,
      });
    }
  };

  return (
    <div className={style.formContainer}>
      <h2>Editar Libro</h2>

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

        <label className={style.labelForm}>Título:</label>
        <input
          type="text"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
        />

        <label className={style.labelForm}>Autor:</label>
        <input
          type="text"
          name="autor"
          value={formData.autor}
          onChange={handleChange}
        />

        <label className={style.labelForm}>Género:</label>
        <select
          name="id_genero"
          value={formData.id_genero}
          onChange={handleChange}
        >
          <option value="">Selecciona un género</option>
          {generos.map((genero) => (
            <option key={genero.id} value={genero.id}>
              {genero.nombre}
            </option>
          ))}
        </select>

        <label className={style.labelForm}>Saga:</label>
        <select name="saga_id" value={formData.saga_id} onChange={handleChange}>
          <option value="">Selecciona una saga</option>
          {sagas.map((saga) => (
            <option key={saga.id} value={saga.id}>
              {saga.nombre}
            </option>
          ))}
        </select>

        <label className={style.labelForm}>Sinopsis:</label>
        <textarea
          name="sinopsis"
          value={formData.sinopsis}
          onChange={handleChange}
          rows="5"
        />

        <div className={style.checkboxGroup}>
          <label className={style.checkboxLabel}>
            <input
              type="checkbox"
              name="starwars"
              checked={formData.starwars}
              onChange={handleChange}
            />
            ¿Es un libro de Star Wars?
          </label>

          <label className={style.checkboxLabel}>
            <input
              type="checkbox"
              name="comics"
              checked={formData.comics}
              onChange={handleChange}
            />
            ¿Es un cómic?
          </label>
        </div>

        <button className={style.buttonFormEdit} type="submit">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default EditBookForm;
