import { useState, useEffect } from "react";
import style from "../css/Carrusel.module.css";
import ArrowRightCarrusel from "./icons/ArrowRightCarrusel";
import ArrowLeftCarrusel from "./icons/ArrowLeftCarrusel";

const Carrusel = ({ items, onItemClick, type }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);

  // Determinar los nombres de las claves en función del tipo
  const nameKey = type === "sagas" ? "saga" : "genero";
  const coverKey = type === "sagas" ? "coverSaga" : "coverGenero";

  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? items.length - visibleItems : currentIndex - 1;
    setCurrentIndex(newIndex);
    loadBooksForCurrentItem(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex >= items.length - visibleItems ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    loadBooksForCurrentItem(newIndex);
  };

  const loadBooksForCurrentItem = (index) => {
    const item = items[index];
    if (item) {
      onItemClick(item);
    }
  };

  const updateVisibleItems = () => {
    const width = window.innerWidth;
    if (width < 1060) {
      setVisibleItems(1);
    } else if (width < 1400) {
      setVisibleItems(2);
    } else {
      setVisibleItems(3);
    }
  };

  useEffect(() => {
    updateVisibleItems();
    window.addEventListener("resize", updateVisibleItems);

    return () => {
      window.removeEventListener("resize", updateVisibleItems);
    };
  }, []);

  if (!Array.isArray(items)) {
    return <p>Error: los datos no son válidos</p>;
  }

  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex >= items.length - visibleItems;

  return (
    <div className={style.container}>
      <ArrowLeftCarrusel
        onClick={handlePrev}
        isDisabled={isPrevDisabled}
        className={`${style.arrow} ${isPrevDisabled ? style.disabled : ''}`}
      />
      <div className={style.carrusel}>
        {items.slice(currentIndex, currentIndex + visibleItems).map((item, index) => (
          <div
            key={index}
            className={style.sagaItem}
            onClick={() => {
              console.log(`${type} clickeado: ${item[nameKey]}`);
              onItemClick(item);
            }}
          >
            <img src={item[coverKey]} alt={item[nameKey]} />
            <p>{item[nameKey]}</p>
          </div>
        ))}
      </div>
      <ArrowRightCarrusel
        onClick={handleNext}
        isDisabled={isNextDisabled}
        className={`${style.arrow} ${isNextDisabled ? style.disabled : ''}`}
      />
    </div>
  );
};

export default Carrusel;
