import style from "../css/BooksRow.module.css";

const BookAuthor = ({ autor }) => (
  <div className={style.containerAutor}>
    <span>{autor}</span>
  </div>
);

export default BookAuthor;