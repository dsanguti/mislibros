import { useState } from "react";
import style from "../css/Search.module.css";
import Lupa from "./icons/Lupa";
import CancelSearch from "./icons/CancelSearch";

const Search = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className={style.container}>
      <div className={style.searchWrapper}>
        <Lupa className={style.lupa} />
        <input
          type="search"
          name="search"
          id="searchBooks"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Libros, autor, género"
        />
        {searchTerm && (
          <CancelSearch className={style.cancelSearch} onClick={clearSearch} />
        )}
      </div>
    </div>
  );
};

export default Search;