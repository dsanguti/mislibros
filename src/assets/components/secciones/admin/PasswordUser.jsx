import style from "../../../css/Admin.module.css";

const PasswordUser = ({password})=>{
  return (
    <div className={style.containerPassword}>
      <span>{password}</span>
    </div>
  );
}

export default PasswordUser;