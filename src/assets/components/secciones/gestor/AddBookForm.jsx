import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from "../../../css/Gestor.module.css";
import { API_ENDPOINTS } from "../../../../config/api";

const AddBookForm = ({ metadata, file, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    title: metadata?.title || "",
    author: metadata?.author || "",
    description: metadata?.sinopsis || "",
    genre: "",
    saga: "",
    coverFile: metadata?.cover || null,
    starwars: false,
    comics: false,
  });

  const [coverPreview, setCoverPreview] = useState(
    metadata?.cover ? URL.createObjectURL(metadata.cover) : null
  );
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
          API_ENDPOINTS.GENERO_ENUM,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (genresResponse.status === 403) {
          // Token expirado o inválido
          console.error("Token expirado o inválido");
          toast.error("Sesión expirada. Por favor, inicie sesión nuevamente");
          // Redirigir al login
          window.location.href = "/login";
          return;
        }

        if (!genresResponse.ok) {
          throw new Error("Error al obtener los géneros");
        }

        const genresData = await genresResponse.json();
        setGenres(genresData);

        // Obtener sagas
        const sagasResponse = await fetch(API_ENDPOINTS.SAGAS, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (sagasResponse.status === 403) {
          // Token expirado o inválido
          console.error("Token expirado o inválido");
          toast.error("Sesión expirada. Por favor, inicie sesión nuevamente");
          // Redirigir al login
          window.location.href = "/login";
          return;
        }

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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

      // Función para limpiar texto HTML
      const cleanHtmlText = (text) => {
        if (!text) return "";

        // Crear un elemento temporal
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = text;

        // Obtener solo el texto
        const cleanText = tempDiv.textContent || tempDiv.innerText;

        // Limpiar espacios extra
        return cleanText.replace(/\s+/g, " ").trim();
      };

      const formDataToSend = new FormData();
      formDataToSend.append("titulo", formData.title);
      formDataToSend.append("autor", formData.author);
      formDataToSend.append("sinopsis", cleanHtmlText(formData.description));
      formDataToSend.append("id_genero", formData.genre);
      formDataToSend.append("saga_id", formData.saga || "");
      formDataToSend.append("starwars", formData.starwars ? "1" : "0");
      formDataToSend.append("comics", formData.comics ? "1" : "0");
      formDataToSend.append("file", file);

      // Verificar si hay una carátula extraída o seleccionada
      if (formData.coverFile) {
        console.log("Enviando carátula:", formData.coverFile);
        // Si es un Blob (carátula extraída), convertirlo a File
        if (
          formData.coverFile instanceof Blob &&
          !(formData.coverFile instanceof File)
        ) {
          const coverFile = new File([formData.coverFile], "cover.jpg", {
            type: "image/jpeg",
          });
          formDataToSend.append("cover", coverFile);
        } else {
          formDataToSend.append("cover", formData.coverFile);
        }
      }

      console.log("Enviando formulario con los siguientes datos:");
      console.log("Título:", formData.title);
      console.log("Autor:", formData.author);
      console.log("Sinopsis:", formData.description);
      console.log("Género:", formData.genre);
      console.log("Saga:", formData.saga);
      console.log("Star Wars:", formData.starwars);
      console.log("Comics:", formData.comics);
      console.log("Archivo:", file);
      console.log("Carátula:", formData.coverFile);

      const response = await fetch(API_ENDPOINTS.ADD_BOOK, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error al añadir el libro");
        }

        if (onSuccess) onSuccess();
      } else {
        // Si no es JSON, obtener el texto de la respuesta
        const text = await response.text();
        console.error("Respuesta no JSON del servidor:", text);
        throw new Error("Error del servidor: Respuesta no válida");
      }
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
    <div className={`${style.formContainer} ${style.bookFormContainer}`}>
      <h2 className={style.myTittleForm}>Añadir Nuevo Libro</h2>

      <form className={style.formEdit} onSubmit={handleSubmit}>
        <div className={style.formLeftColumn}>
          <label className={style.labelForm}>Carátula:</label>
          <div className={style.containerCoverPreview}>
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Vista previa de la carátula"
                className={style.coverPreview}
              />
            )}
          </div>
          <input
            type="file"
            name="cover"
            accept="image/*"
            onChange={handleCoverChange}
            className={style.coverInput}
          />
          {metadata?.cover && (
            <p className={style.coverHelp}>
              Carátula extraída del archivo. Puedes seleccionar otra si lo
              deseas.
            </p>
          )}
        </div>

        <div className={style.formRightColumn}>
          {error && <p className={style.error}>{error}</p>}

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

          <label className={style.labelForm}>Género:</label>
          <select
            name="genre"
            value={formData.genre}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccionar género</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.nombre}
              </option>
            ))}
          </select>

          <label className={style.labelForm}>Saga:</label>
          <select
            name="saga"
            value={formData.saga}
            onChange={handleInputChange}
          >
            <option value="">Seleccionar saga</option>
            {sagas.map((saga) => (
              <option key={saga.id} value={saga.id}>
                {saga.nombre}
              </option>
            ))}
          </select>

          <div className={style.checkboxGroup}>
            <label className={style.checkboxLabel}>
              ¿Es un libro de Star Wars?
              <input
                type="checkbox"
                name="starwars"
                checked={formData.starwars}
                onChange={handleInputChange}
              />
            </label>

            <label className={style.checkboxLabel}>
              ¿Es un cómic?
              <input
                type="checkbox"
                name="comics"
                checked={formData.comics}
                onChange={handleInputChange}
              />
            </label>
          </div>

          <div className={style.buttonContainerEditSaga}>
            <button
              type="button"
              className={style.buttonFormCancel}
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
        </div>
      </form>
    </div>
  );
};

export default AddBookForm;
