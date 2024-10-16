import { useEffect, useState } from "react";
import { NavLink} from "react-router-dom"; // Asegúrate de importar useMatch
import style from "../css/Nav.module.css";
import Ham from "./Ham";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  

  return (
    <nav className={style.navbar}>
      <Ham isOpen={isOpen} toggleMenu={toggleMenu} />
      <ul className={`${style.ul} ${isOpen ? style.open : ""}`}>
        <li>
          <NavLink
            to="/"
            onClick={toggleMenu}
            className={({ isActive }) => (isActive ? style.isActive : "")}
          >
            Inicio
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/sagas"
            onClick={toggleMenu}
            className={({ isActive }) => (isActive ? style.isActive : "")}
          >
            Sagas
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/generos"
            onClick={toggleMenu}
            className={({ isActive }) => (isActive ? style.isActive : "")}
          >
            Géneros
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/starwars"
            onClick={toggleMenu}
            className={({ isActive }) => (isActive ? style.isActive : "")}
          >
            StarWars
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/comics"
            onClick={toggleMenu}
            className={({ isActive }) => (isActive ? style.isActive : "")}
          >
            Comics
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
