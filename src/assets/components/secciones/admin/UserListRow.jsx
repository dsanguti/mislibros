import style from "../../../css/Admin.module.css";
import UserRow from "./UserRow";

const UserListRow = ({
  users = [],
  error,
  loading,
  onUserClick,
  onEditClick,
  onDeleteClick,
}) => {
  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p>Error al cargar los usuarios</p>;
  if (!Array.isArray(users) || users.length === 0)
    return <p>No hay usuarios</p>;

  // Debug: mostrar los datos de los usuarios
  console.log("Datos de usuarios recibidos:", users);

  return (
    <div className={style.containerUserRows}>
      {users.map((user) => (
        <UserRow
          key={user.id}
          user={user.user}
          name={user.name}
          lastname={user.lastname}
          mail={user.mail}
          profile={user.profile}
          verificado={user.is_verified}
          onClick={() => onUserClick(user)}
          onEditClick={() => onEditClick(user)}
          onDeleteClick={() => onDeleteClick(user)}
        />
      ))}
    </div>
  );
};

export default UserListRow;
