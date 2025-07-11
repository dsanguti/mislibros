import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Importa useNavigate
import Ham from "../components/icons/Ham";
import style from "../css/Nav.module.css";
import { useAuth } from "./autenticacion/UseAuth"; // Importa el hook de autenticación
import GestorIcon from "./icons/GestorIcon";
import Key_Icon from "./icons/Key_Icon";
import Logout from "./icons/Logout";
import User from "./icons/User";
import ProfileModal from "./ProfileModal";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const { logout, user } = useAuth(); // Desestructura el método de logout y el usuario desde el contexto de autenticación
  const navigate = useNavigate(); // Instancia de useNavigate para navegación programática

  // Log temporal para depuración
  useEffect(() => {
    console.log("Usuario en Nav:", user);
    console.log("Perfil del usuario:", user?.profile);
  }, [user]);

  const toggleMenu = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen) {
      // Guardar la posición actual del scroll
      setScrollPosition(window.pageYOffset);
      document.body.classList.add("menu-open");
      // Forzar el scroll a la posición guardada para evitar saltos
      document.body.style.top = `-${window.pageYOffset}px`;
    } else {
      document.body.classList.remove("menu-open");
      // Restaurar la posición del scroll
      document.body.style.top = "";
      window.scrollTo(0, scrollPosition);
    }
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    closeMenu(); // Cerrar el menú móvil si está abierto
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
        document.body.classList.remove("menu-open");
        document.body.style.top = "";
        window.scrollTo(0, scrollPosition);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [scrollPosition]);

  // Limpiar la clase menu-open cuando el componente se desmonte
  useEffect(() => {
    return () => {
      document.body.classList.remove("menu-open");
      document.body.style.top = "";
    };
  }, []);

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    const preventScroll = (e) => {
      if (isOpen) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    if (isOpen) {
      document.addEventListener("touchmove", preventScroll, { passive: false });
      document.addEventListener("wheel", preventScroll, { passive: false });
      document.addEventListener("scroll", preventScroll, { passive: false });
    }

    return () => {
      document.removeEventListener("touchmove", preventScroll);
      document.removeEventListener("wheel", preventScroll);
      document.removeEventListener("scroll", preventScroll);
    };
  }, [isOpen]);

  // Función para manejar la salida de la sesión
  const handleLogout = () => {
    logout(); // Llama a la función de logout del contexto
  };

  // Función para cerrar el menú y limpiar la clase del body
  const closeMenu = () => {
    setIsOpen(false);
    document.body.classList.remove("menu-open");
    // Restaurar la posición del scroll
    document.body.style.top = "";
    window.scrollTo(0, scrollPosition);
  };

  // Función para navegar a la sección de "Gestor"
  const goToGestor = () => {
    navigate("/gestor"); // Navega a la ruta /gestor
    closeMenu(); // Cierra el menú después de navegar
  };

  // Función para navegar a la sección de "Admin"
  const goToAdmin = () => {
    navigate("/admin"); // Navega a la ruta /admin
    closeMenu(); // Cierra el menú después de navegar
  };

  return (
    <>
      {/* Overlay para prevenir scroll cuando el menú está abierto */}
      <div
        className={`${style["menu-overlay"]} ${isOpen ? style.open : ""}`}
        onClick={closeMenu}
      />

      <nav className={style.navbar}>
        <Ham isOpen={isOpen} toggleMenu={toggleMenu} />

        <ul className={`${style.ul} ${isOpen ? style.open : ""}`}>
          <li>
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? style.isActive : "")}
            >
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/sagas"
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? style.isActive : "")}
            >
              Sagas
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/generos"
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? style.isActive : "")}
            >
              Géneros
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/starwars"
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? style.isActive : "")}
            >
              StarWars
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/comics"
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? style.isActive : "")}
            >
              Comics
            </NavLink>
          </li>
          <li className={style.userMenu}>
            <div className={style.containeruser} onClick={openProfileModal}>
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

      {/* Modal del perfil de usuario */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />
    </>
  );
};

export default Nav;
