import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from "../../../css/Gestor.module.css";

const DeleteBookForm = ({ book, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("No tienes permiso para eliminar el libro.", {
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8001/api/delete_book/${book.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Error al eliminar el libro", {
          autoClose: 3000,
        });
        return;
      }

      toast.success("Libro eliminado correctamente.", { autoClose: 1000 });

      if (typeof onDelete === "function") onDelete();
      setTimeout(() => {
        if (typeof onClose === "function") onClose();
      }, 2000);
    } catch (err) {
      console.error("Error al eliminar el libro:", err);
      toast.error("Hubo un problema al eliminar el libro.", {
        autoClose: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={style.formContainer}>
      <h2 className={style.myTittleFormDelete}>Eliminar Libro</h2>

      <div className={style.deleteConfirmation}>
        <div className={style.containerCoverPreview}>
          {book.cover && (
            <img
              src={book.cover}
              alt="Carátula del libro"
              className={style.coverPreview}
            />
          )}
        </div>

        <h3>¿Estás seguro de que deseas eliminar el libro?</h3>
        <p className={style.bookTitle}>{book.titulo}</p>

        <div className={style.buttonContainer}>
          <button
            className={`${style.buttonFormDelete} ${
              isDeleting ? style.disabled : ""
            }`}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar Libro"}
          </button>
          <button
            className={style.buttonFormCancel}
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBookForm;
