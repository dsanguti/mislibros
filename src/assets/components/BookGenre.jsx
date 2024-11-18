import style from "../css/BooksRow.module.css";

const BookGenre = ({ genero }) => (
  <div className={style.containerGenero}>
    <span>{genero}</span>
  </div>
);

export default BookGenre;
