// HeaderRow.jsx
import style from "../css/BooksListRow.module.css";

const HeaderRow = () => {
  return (
    <div className={style.headerRow}>
      <div className={style.headerTitulo}>Titulo</div>
      <div className={style.headerAutor}>Autor</div>
      <div className={style.headerGenero}>Genero</div>
    </div>
  );
};

export default HeaderRow;