import style from "../../../css/Admin.module.css";
import Delete_Icon from "../../icons/Delete_Icon";
import Edit_Icon from "../../icons/Edit_Icon";
import EmailUser from "./EmailUser";
import LastnameUser from "./LastnameUser";
import NameUser from "./NameUser";
import ProfileUser from "./ProfileUser";
import UserUser from "./UserUser";

const UserRow = ({
  user,
  name,
  lastname,
  mail,
  profile,
  onClick,
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <div className={style.containerUserRow} onClick={onClick}>
      <div className={style.user}>
        <UserUser user={user} />
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
        <Edit_Icon
          onClick={(e) => {
            e.stopPropagation();
            onEditClick();
          }}
          className={style.iconEdit}
        />
        <Delete_Icon
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick();
          }}
          className={style.iconDelete}
        />
      </div>
    </div>
  );
};

export default UserRow;
