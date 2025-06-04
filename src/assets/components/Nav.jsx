import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Importa useNavigate
import Ham from "../components/icons/Ham";
import style from "../css/Nav.module.css";
import { useAuth } from "./autenticacion/UseAuth"; // Importa el hook de autenticación
import GestorIcon from "./icons/GestorIcon";
import Key_Icon from "./icons/Key_Icon";
import Logout from "./icons/Logout";
import User from "./icons/User";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth(); // Desestructura el método de logout y el usuario desde el contexto de autenticación
  const navigate = useNavigate(); // Instancia de useNavigate para navegación programática

  // Log temporal para depuración
  useEffect(() => {
    console.log("Usuario en Nav:", user);
    console.log("Perfil del usuario:", user?.profile);
  }, [user]);

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

  // Función para navegar a la sección de "Admin"
  const goToAdmin = () => {
    navigate("/admin"); // Navega a la ruta /admin
    toggleMenu(); // Cierra el menú después de navegar
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
            {user?.profile === "Admin" && (
              <li>
                <div className={style.containerKey}>
                  <Key_Icon className={style.keyIcon} />
                  <h4 onClick={goToAdmin}>Admin</h4>
                </div>
              </li>
            )}
            <li>
              <div className={style.containerGestor}>
                <GestorIcon className={style.userIcon} />
                <h4 onClick={goToGestor}>Gestor</h4>{" "}
                {/* Evento onClick para redirigir */}
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
