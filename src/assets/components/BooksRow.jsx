import style from "../css/BooksRow.module.css";
import BookTitle from "./BookTittle";
import BookAuthor from "./BookAuthor";

const BooksRow = ({ titulo, autor, genero}) => {
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
    </div>
  );
};

export default BooksRow;