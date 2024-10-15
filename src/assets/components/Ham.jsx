
import style from "../css/Nav.module.css";

const Ham = ({ isOpen, toggleMenu }) => {
  return (
    <div className={`${style.hamburger} ${isOpen ? style.active : ""}`} onClick={toggleMenu}>
      {/* Icono de menú hamburguesa */}
      <span className={style.bar}></span>
      <span className={style.bar}></span>
      <span className={style.bar}></span>
    </div>
  );
};

export default Ham;

