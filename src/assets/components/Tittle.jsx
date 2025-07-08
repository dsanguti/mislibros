import PropTypes from "prop-types"; // Importa PropTypes
import { NavLink } from "react-router-dom";
import style from "../css/tittle.module.css";
import { useTheme } from "./hooks/useTheme";

const Tittle = ({ children }) => {
  const { getCurrentTheme } = useTheme();
  const currentTheme = getCurrentTheme();

  const logoSrc =
    currentTheme === "dark" ? "/logoAppColorDark.png" : "/logoAppColor.png";

  return (
    <NavLink className={style.a} to="/">
      <div className={style.container}>
        <div className={style.containertittle}>
          <img className={style.logo} src={logoSrc} alt="logo de App" />
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
