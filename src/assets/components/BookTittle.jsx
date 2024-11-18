import style from "../css/BooksRow.module.css"


const BookTitle = ({titulo})=>(
  <div className={style.containerTitulo}>
    <span>{titulo}</span>
  </div>

)

export default BookTitle;