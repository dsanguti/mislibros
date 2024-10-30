import PropTypes from "prop-types"; // Importa PropTypes
import { NavLink } from "react-router-dom";
import style from "../css/tittle.module.css";

const Tittle = ({ children }) => {
  return (
    <NavLink className={style.a} to="/">
    <div className={style.container}>
 
        <div className={style.containertittle}>
          <img
            className={style.logo}
            src="/logoAppColor.png"
            alt="logo de App"
          />
          <h1 className={style.tittle}>{children}</h1>
        </div>
        <h3 className={style.subtittle}> Tu biblioteca siempre a mano</h3>
     
    </div>
    </NavLink>
  );
};

// Agrega la validación de propiedades
Tittle.propTypes = {
  children: PropTypes.node.isRequired, // Valida que children sea un nodo y es requerido
};

export default Tittle;
