import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from "../../../css/Gestor.module.css";

const AddBookForm = ({ metadata, file, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    title: metadata?.title || "",
    author: metadata?.author || "",
    description: metadata?.description || "",
    isbn: metadata?.isbn || "",
    publisher: metadata?.publisher || "",
    publicationYear: metadata?.publicationYear || "",
    genre: "",
    saga: "",
    coverFile: null,
  });

  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [genres, setGenres] = useState([]);
  const [sagas, setSagas] = useState([]);

  // Cargar géneros y sagas al montar el componente
  useEffect(() => {
    const fetchGenresAndSagas = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No hay token de autenticación");
        }

        // Obtener géneros
        const genresResponse = await fetch(
          "http://localhost:8001/api/generoEnum",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!genresResponse.ok) {
          throw new Error("Error al obtener los géneros");
        }

        const genresData = await genresResponse.json();
        setGenres(genresData);

        // Obtener sagas
        const sagasResponse = await fetch("http://localhost:8001/api/sagas", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!sagasResponse.ok) {
          throw new Error("Error al obtener las sagas");
        }

        const sagasData = await sagasResponse.json();
        setSagas(sagasData);
      } catch (error) {
        console.error("Error al cargar géneros y sagas:", error);
        toast.error("Error al cargar géneros y sagas");
        if (onError) onError(error.message);
      }
    };

    fetchGenresAndSagas();
  }, [onError]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejar la selección de la carátula
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        coverFile: file,
      }));

      // Crear una vista previa de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("titulo", formData.title);
      formDataToSend.append("autor", formData.author);
      formDataToSend.append("sinopsis", formData.description);
      formDataToSend.append("isbn", formData.isbn);
      formDataToSend.append("editorial", formData.publisher);
      formDataToSend.append("año_publicacion", formData.publicationYear);
      formDataToSend.append("id_genero", formData.genre);
      formDataToSend.append("saga_id", formData.saga || "");
      formDataToSend.append("archivo", file);

      if (formData.coverFile) {
        formDataToSend.append("cover", formData.coverFile);
      }

      const response = await fetch("http://localhost:8001/api/add_book", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al añadir el libro");
      }

      toast.success("Libro añadido correctamente");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      setError(error.message);
      toast.error(error.message);
      if (onError) onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.formContainer}>
      <h2>Añadir Nuevo Libro</h2>

      <form className={style.formEdit} onSubmit={handleSubmit}>
        <label className={style.labelForm}>Título:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />

        <label className={style.labelForm}>Autor:</label>
        <input
          type="text"
          name="author"
          value={formData.author}
          onChange={handleInputChange}
          required
        />

        <label className={style.labelForm}>Descripción:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="4"
        />

        <label className={style.labelForm}>ISBN:</label>
        <input
          type="text"
          name="isbn"
          value={formData.isbn}
          onChange={handleInputChange}
        />

        <label className={style.labelForm}>Editorial:</label>
        <input
          type="text"
          name="publisher"
          value={formData.publisher}
          onChange={handleInputChange}
        />

        <label className={style.labelForm}>Año de publicación:</label>
        <input
          type="number"
          name="publicationYear"
          value={formData.publicationYear}
          onChange={handleInputChange}
          min="1000"
          max={new Date().getFullYear()}
        />

        <label className={style.labelForm}>Género:</label>
        <select
          name="genre"
          value={formData.genre}
          onChange={handleInputChange}
        >
          <option value="">Seleccionar género</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.nombre}
            </option>
          ))}
        </select>

        <label className={style.labelForm}>Saga:</label>
        <select name="saga" value={formData.saga} onChange={handleInputChange}>
          <option value="">Seleccionar saga</option>
          {sagas.map((saga) => (
            <option key={saga.id} value={saga.id}>
              {saga.nombre}
            </option>
          ))}
        </select>

        <label className={style.labelForm}>Carátula:</label>
        <input
          type="file"
          name="cover"
          accept="image/*"
          onChange={handleCoverChange}
        />
        {coverPreview && (
          <div className={style.containerCoverPreview}>
            <img
              src={coverPreview}
              alt="Vista previa"
              className={style.coverPreview}
            />
          </div>
        )}

        {error && <p className={style.error}>{error}</p>}

        <div className={style.formActions}>
          <button
            type="button"
            className={style.cancelButton}
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className={style.buttonFormEdit}
            type="submit"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Libro"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBookForm;
