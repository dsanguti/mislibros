import style from "../../../css/admin.module.css";

const UserUser = ({user})=>{
  return (
    <div className={style.containerUser}>
      <span>{user}</span>
    </div>
  );
}
export default UserUser;