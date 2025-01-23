// HeaderRow.jsx
import style from "../css/BooksListRow.module.css";

const HeaderRow = () => {
  return (
    <div className={style.headerRow}>
      <div className={style.headerTitulo}>Título</div>
      <div className={style.headerAutor}>Autor</div>
      <div className={style.headerGenero}>Género</div>
    </div>
  );
};

export default HeaderRow;