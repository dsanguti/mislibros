// HeaderRow.jsx
import style from "../css/BooksListRow.module.css";

const HeaderRowEdit = () => {
  return (
    <div className={style.headerRow}>
      <div className={style.headerTitulo}>Título</div>
      <div className={style.headerAutor}>Autor</div>
      <div className={style.headerGenero}>Género</div>
      <div className={style.headerEdit}>Edit / Delete</div>
    </div>
  );
};

export default HeaderRowEdit;
