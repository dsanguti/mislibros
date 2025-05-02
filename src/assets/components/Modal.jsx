import style from "../css/Modal.module.css";

const Modal = ({ isOpen, onClose, children, modalType }) => {
  if (!isOpen) return null;

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Determinar la clase del modal según el tipo
  const modalContentClass =
    modalType === "editBook"
      ? `${style.modalContent} ${style.modalContentWide}`
      : style.modalContent;

  return (
    <div className={style.modalOverlay} onClick={handleBackgroundClick}>
      <div className={modalContentClass}>
        <button className={style.closeButton} onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
