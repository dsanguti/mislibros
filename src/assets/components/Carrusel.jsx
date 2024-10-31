import { useState } from "react";
import style from "../css/Carrusel.module.css"

const Carrusel=({libros})=>{


  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleItems = 3;

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? libros.length - visibleItems : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= libros.length - visibleItems ? 0 : prevIndex + 1
    );
  };

  return (
    <div className={style.container}>
      <button onClick={handlePrev}>Anterior</button>
      <div className={style.carrusel}>
        {libros.slice(currentIndex, currentIndex + visibleItems).map((libro, index) => (
          <div className={style.libroItem} key={index}>
            <img src={libro.cover} alt={libro.titulo} />
            <h3>{libro.titulo}</h3>
          </div>
        ))}
      </div>
      <button onClick={handleNext}>Siguiente</button>
    </div>
  );
};


export default Carrusel;