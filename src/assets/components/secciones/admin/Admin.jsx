import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import style from "../../../css/Admin.module.css";
import HeaderUserRow from "./HeaderUserRow";
import UserListRow from "./UserListRow";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch("http://localhost:8001/api/all_users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        toast.error("No tienes permisos para acceder a esta sección");
        setError("No tienes permisos para acceder a esta sección");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Error al obtener los usuarios");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    // Aquí podrías abrir un modal para editar o mostrar más detalles del usuario
    console.log("Usuario seleccionado:", user);
  };

  return (
    <div className={style.containerAdmin}>
      <div className={style.tittle}>
        <h3>Usuarios de misLibros</h3>
        <p>
          Aquí puede ver todos los usuarios de su biblioteca y gestionarlos.
        </p>
      </div>
      <div className={style.containerUserList}>
        <HeaderUserRow />
        <UserListRow
          users={users}
          loading={loading}
          error={error}
          onUserClick={handleUserClick}
        />
      </div>
    </div>
  );
};

export default Admin;
