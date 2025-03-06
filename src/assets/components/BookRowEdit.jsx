import Delete_Icon from "../components/icons/Delete_Icon";
import Edit_Icon from "../components/icons/Edit_Icon";
import style from "../css/BooksRow.module.css";
import BookAuthor from "./BookAuthor";
import BookTitle from "./BookTittle";

const BooksRowEdit = ({
  titulo,
  autor,
  genero,
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <div className={style.container}>
      <div className={style.titulo}>
        <BookTitle titulo={titulo} />
      </div>
      <div className={style.autor}>
        <BookAuthor autor={autor} />
      </div>
      <div className={style.genero}>
        <BookAuthor autor={genero} />
      </div>
      <div className={style.icons}>
      <Edit_Icon onClick={(e) => { e.stopPropagation(); onEditClick(); }} className={style.iconEdit} />
      {" "}
        <Delete_Icon onClick={onDeleteClick} className={style.iconDelete} />
      </div>
    </div>
  );
};

export default BooksRowEdit;
