import style from "../../../css/Admin.module.css";

const VerificadoUser = ({ verificado }) => {
  // Convertir el valor a booleano si es necesario
  const isVerified =
    verificado === 1 ||
    verificado === true ||
    verificado === "1" ||
    verificado === "true";

  return (
    <div className={style.containerVerificado}>
      <span className={isVerified ? style.verified : style.notVerified}>
        {isVerified ? "✓" : "✗"}
      </span>
    </div>
  );
};

export default VerificadoUser;
