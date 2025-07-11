import style from "../../../css/Admin.module.css";

const UserUser = ({user})=>{
  return (
    <div className={style.containerUser}>
      <span>{user}</span>
    </div>
  );
}
export default UserUser;