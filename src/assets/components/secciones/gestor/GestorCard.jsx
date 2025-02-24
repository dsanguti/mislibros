import style from "../../../css/Gestor.module.css";

const GestorCard = ({ icon: Icon, description, onClick }) => {
  return (
    <>
      <div className={style.card} onClick={onClick}>
        {Icon && <Icon className={style.icon} />}{" "}
        {/* Renderiza el icono si se proporciona */}
        <p>{description}</p> {/* Renderiza la descripción */}
      </div>
    </>
  );
};

export default GestorCard;
