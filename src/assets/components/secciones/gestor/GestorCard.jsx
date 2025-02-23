import style from "../../../css/Gestor.module.css";

const GestorCard = ({ icon: Icon, description }) => {
  return (
    <>
      <div className={style.card}>
        {Icon && <Icon className={style.icon} />}{" "}
        {/* Renderiza el icono si se proporciona */}
        <p>{description}</p> {/* Renderiza la descripción */}
      </div>
    </>
  );
};

export default GestorCard;
