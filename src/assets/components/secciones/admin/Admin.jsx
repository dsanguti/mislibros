import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import style from "../../../css/Admin.module.css";
import styles from "../../../css/Gestor.module.css";
import AddSaga_Icon from "../../icons/AddSaga_Icon";
import Modal from "../../Modal";
import AddUserForm from "./AddUserForm";
import DeleteUserForm from "./DeleteUserForm";
import EditUserForm from "./EditUserForm";
import HeaderUserRow from "./HeaderUserRow";
import UserListRow from "./UserListRow";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

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

  const handleAddClick = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setIsDeleting(false);
    setIsAdding(true);
    setModalOpen(true);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsEditing(false);
    setIsDeleting(false);
    setIsAdding(false);
    setModalOpen(false);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
    setIsDeleting(false);
    setIsAdding(false);
    setModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleting(true);
    setIsEditing(false);
    setIsAdding(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setIsEditing(false);
    setIsDeleting(false);
    setIsAdding(false);
  };

  const handleUpdate = () => {
    fetchUsers();
  };

  return (
    <div className={style.containerAdmin}>
      <div className={style.tittle}>
        <h3>Usuarios de misLibros</h3>
        <p>
          Aquí puede ver todos los usuarios de su biblioteca y gestionarlos.
        </p>
      </div>
      <div className={styles.AddSagaIcon} onClick={handleAddClick}>
        <AddSaga_Icon />
      </div>
      <div className={style.containerUserList}>
        <HeaderUserRow />
        <UserListRow
          users={users}
          loading={loading}
          error={error}
          onUserClick={handleUserClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      </div>

      {/* Modal para edición/eliminación/creación */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          modalType={isEditing ? "editUser" : undefined}
        >
          {isEditing && selectedUser ? (
            <EditUserForm
              user={selectedUser}
              onClose={closeModal}
              onUpdate={handleUpdate}
            />
          ) : isDeleting && selectedUser ? (
            <DeleteUserForm
              user={selectedUser}
              onClose={closeModal}
              onDelete={handleUpdate}
            />
          ) : isAdding ? (
            <AddUserForm onClose={closeModal} onAdd={handleUpdate} />
          ) : null}
        </Modal>
      )}
    </div>
  );
};

export default Admin;
