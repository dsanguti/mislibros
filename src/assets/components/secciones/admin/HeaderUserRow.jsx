import style from "../../../css/Admin.module.css";

const HeaderUserRow = () => {
  return (
    <div className={style.containerHeaderUser}>
      <div className={style.headerUser}>Usuario</div>
      <div className={style.headerPassword}>Contraseña</div>
      <div className={style.headerName}>Nombre</div>
      <div className={style.headerLastname}>Apellido</div>
      <div className={style.headerEmail}>Email</div>
      <div className={style.headerProfile}>Perfil</div>
      <div className={style.headerEdit}>Editar / Eliminar</div>
    </div>
  );
};
export default HeaderUserRow;
