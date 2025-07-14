import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from "../../../css/Admin.module.css";
import { API_ENDPOINTS } from "../../../../config/api";

const DeleteUserForm = ({ user, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("No tienes permiso para eliminar usuarios.", {
        autoClose: 3000,
      });
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.DELETE_USER}/${user.id}`,
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
        toast.error(result.error || "Error al eliminar el usuario", {
          autoClose: 3000,
        });
        return;
      }

      toast.success("Usuario eliminado correctamente.", { autoClose: 1000 });

      if (typeof onDelete === "function") onDelete();
      setTimeout(() => {
        if (typeof onClose === "function") onClose();
      }, 2000);
    } catch (err) {
      console.error("Error al eliminar el usuario:", err);
      toast.error("Hubo un problema al eliminar el usuario.", {
        autoClose: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={style.formContainer}>
      <h2 className={style.myTittleFormDelete}>Eliminar Usuario</h2>
      <p>
        ¿Estás seguro de que deseas eliminar al usuario &ldquo;
        <strong>{user.user}</strong>&rdquo;?
      </p>
      <p>Esta acción no se puede deshacer.</p>

      <div className={style.buttonContainer}>
        <button className={style.buttonFormCancel} onClick={onClose}>
          Cancelar
        </button>
        <button
          className={style.buttonFormDelete}
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </div>
  );
};

export default DeleteUserForm;
