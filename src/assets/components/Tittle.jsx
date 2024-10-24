
import PropTypes from 'prop-types'; // Importa PropTypes
import style from "../css/tittle.module.css";

const Tittle = ({ children }) => {
  return (
    <div className={style.container}>
      <h1 className={style.tittle}>{children}</h1>
      <h3 className={style.subtittle}> Tu biblioteca siempre a mano</h3>
    </div>
  );
};

// Agrega la validación de propiedades
Tittle.propTypes = {
  children: PropTypes.node.isRequired, // Valida que children sea un nodo y es requerido
};

export default Tittle;
