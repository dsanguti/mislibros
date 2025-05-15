import style from "../../../css/Admin.module.css";

const NameUser = ({name})=>{
  return (
    <div className={style.containerName}>
      <span>{name}</span>
    </div>
  );
}

export default NameUser;