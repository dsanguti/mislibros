import style from "../../../css/Admin.module.css";

const ProfileUser = ({profile})=>{
  return (
    <div className={style.containerProfile}>
      <span>{profile}</span>
    </div>
  );
}

export default ProfileUser;