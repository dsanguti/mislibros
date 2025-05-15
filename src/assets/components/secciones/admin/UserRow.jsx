import style from "../../../css/Admin.module.css";
import EmailUser from "./EmailUser";
import LastnameUser from "./LastnameUser";
import NameUser from "./NameUser";
import PasswordUser from "./PasswordUser";
import ProfileUser from "./ProfileUser";
import UserUser from "./UserUser";

const UserRow = ({
  user,
  password,
  name,
  lastname,
  mail,
  profile,
  onClick,
}) => {
  return (
    <div className={style.containerUserRow} onClick={onClick}>
      <div className={style.user}>
        <UserUser user={user} />
      </div>
      <div className={style.password}>
        <PasswordUser password={password} />
      </div>
      <div className={style.name}>
        <NameUser name={name} />
      </div>
      <div className={style.lastname}>
        <LastnameUser lastname={lastname} />
      </div>
      <div className={style.email}>
        <EmailUser email={mail} />
      </div>
      <div className={style.profile}>
        <ProfileUser profile={profile} />
      </div>
      <div className={style.actions}>
        {/* Aquí irían los iconos de editar y eliminar */}
        <span className={style.iconEdit}>✏️</span>
        <span className={style.iconDelete}>🗑️</span>
      </div>
    </div>
  );
};

export default UserRow;
