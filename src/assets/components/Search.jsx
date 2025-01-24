import style from "../css/Search.module.css"
import { useState } from "react";


const Search =({ onSearch })=>{

  const [searchTerm, seSearchTerm] = useState("");

  const handleSearchChange = (event)=>{
    const value = event.target.value;
    seSearchTerm(value);
    onSearch(value);
  }

  return <div className={style.container}>
    <input 
      type="search"
      name="search"
      id="searchBooks"
      value={searchTerm}
      onChange={handleSearchChange}
      placeholder="Búsqueda de libros, autor, género"/>
  </div>
}

export default Search;