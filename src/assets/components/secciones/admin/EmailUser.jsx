import style from "../../../css/Admin.module.css";

const EmailUser = ({email})=>{
  return (
    <div className={style.containerEmail}>
      <span>{email}</span>
    </div>
  );
}

export default EmailUser;
