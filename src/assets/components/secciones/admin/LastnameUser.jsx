import style from "../../../css/Admin.module.css";

const LastnameUser = ({lastname})=>{
  return (
    <div className={style.containerLastname}>
      <span>{lastname}</span>
    </div>
  );
}

export default LastnameUser;
