import style from '../css/Modal.module.css';


const Modal = ({ isOpen, onClose, children})=>{

  if (!isOpen) return null;

  const handleBackgroundClick = (e)=>{
    if (e.target === e.currentTarget){
      onClose();
    }
  };

  return (

    <div className={style.modalOverlay} onClick={handleBackgroundClick}>
      <div className={style.modalContent}>
        <button className={style.closeButton} onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );


}
export default Modal;