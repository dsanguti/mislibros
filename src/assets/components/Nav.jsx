import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Importa useNavigate
import Ham from "../components/icons/Ham";
import style from "../css/Nav.module.css";
import { useAuth } from "./autenticacion/UseAuth"; // Importa el hook de autenticación
import Logout from "./icons/Logout";
import User from "./icons/User";
import GestorIcon from "./icons/GestorIcon";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth(); // Desestructura el método de logout desde el contexto de autenticación
  const navigate = useNavigate(); // Instancia de useNavigate para navegación programática

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

  // Función para manejar la salida de la sesión
  const handleLogout = () => {
    logout(); // Llama a la función de logout del contexto
  };

  // Función para navegar a la sección de "Gestor"
  const goToGestor = () => {
    navigate("/gestor"); // Navega a la ruta /gestor
    toggleMenu(); // Cierra el manú despues de navegar
  };

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
        <li className={style.userMenu}>
          <div className={style.containeruser}>
            <User className={style.user} />
          </div>
          {/* Submenú desplegable */}
          <ul className={style.submenuUser}>
            <li>
              <div className={style.containerGestor}>
                <GestorIcon className={style.userIcon} />
                <h4 onClick={goToGestor}>Gestor</h4> {/* Evento onClick para redirigir */}
              </div>
            </li>
            <li>
              <div onClick={handleLogout} className={style.containerSalir}>
                <Logout className={style.logout} />
                <h4>Salir</h4>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
