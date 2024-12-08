import style from "../css/BooksRow.module.css";
import BookTitle from "./BookTittle";
import BookAuthor from "./BookAuthor";

const BooksRow = ({ titulo, autor }) => {
  return (
    <div className={style.container}>
      <div className={style.titulo}>
        <BookTitle titulo={titulo} />
      </div>
      <div className={style.autor}>
        <BookAuthor autor={autor} />
      </div>
    </div>
  );
};

export default BooksRow;