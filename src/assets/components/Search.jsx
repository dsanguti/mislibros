import style from "../css/Search.module.css"
const Search =()=>{
  return <div className={style.container}>
    <input type="search" name="search" id="searchBooks" placeholder="Busqueda de libros, autor, género"/>
  </div>
}

export default Search;