import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom"; // Importa NavLink desde react-router-dom
import style from "../css/Nav.module.css";
import Ham from "./Ham";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    console.log("Menu toggled");
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
    <>
      <Ham isOpen={isOpen} toggleMenu={toggleMenu} />

      <nav className={style.navbar}>
        <ul className={`${style.ul} ${isOpen ? style.open : ""}`}>
          <li>
            <NavLink
              to="/"
              onClick={() => {
                toggleMenu();
                console.log("Navigating to Home");
              }}
            >
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/sagas" onClick={toggleMenu}>
              Sagas
            </NavLink>
          </li>
          <li>
            <NavLink to="/generos" onClick={toggleMenu}>
              Géneros
            </NavLink>
          </li>
          <li>
            <NavLink to="/starwars" onClick={toggleMenu}>
              StarWars
            </NavLink>
          </li>
          <li>
            <NavLink to="/comics" onClick={toggleMenu}>
              Comics
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Nav;
