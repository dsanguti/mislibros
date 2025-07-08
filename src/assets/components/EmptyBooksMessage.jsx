import { useNavigate } from "react-router-dom";
import style from "../css/EmptyBooksMessage.module.css";
import Modal from "./Modal";

const EmptyBooksMessage = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleAddBook = () => {
    navigate("/addlibros");
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className={style.emptyContent}>
        <div className={style.iconContainer}>
          <span className={style.bookIcon}>📚</span>
        </div>
        <h2 className={style.title}>¡Tu biblioteca está vacía!</h2>
        <p className={style.message}>
          Aún no has añadido ningún libro a tu biblioteca personal.
        </p>
        <p className={style.suggestion}>
          Comienza a construir tu colección de libros favoritos.
        </p>
        <div className={style.buttonContainer}>
          <button className={style.cancelButton} onClick={handleClose}>
            Cerrar
          </button>
          <button className={style.addButton} onClick={handleAddBook}>
            <span className={style.buttonIcon}>+</span>
            Añadir mi primer libro
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EmptyBooksMessage;
