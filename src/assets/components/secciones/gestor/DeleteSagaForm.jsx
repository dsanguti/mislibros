import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from "../../../css/Gestor.module.css";

const DeleteSagaForm = ({ saga, onClose, onUpdate }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("No tienes permiso para eliminar la saga.", {
        autoClose: 3000,
      });
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("http://localhost:8001/api/delete_saga", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: saga.id }),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Error desconocido", { autoClose: 3000 });
        return;
      }

      toast.success("Saga eliminada correctamente.", { autoClose: 1000 });

      if (typeof onUpdate === "function") onUpdate();
      setTimeout(() => {
        if (typeof onClose === "function") onClose();
      }, 2000);
    } catch {
      toast.error("Hubo un problema al eliminar la saga.", { autoClose: 3000 });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={style.formContainer}>
      <h2 className={style.myTittleFormDelete}>Eliminar Saga</h2>
      <p>
        ¿Estás seguro de que deseas eliminar la saga &ldquo;
        <strong>{saga.nombre}</strong>&rdquo;?
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

export default DeleteSagaForm;
