import { useCallback, useEffect, useState } from "react";
import style from "../css/Carrusel.module.css";
import ArrowLeftCarrusel from "./icons/ArrowLeftCarrusel";
import ArrowRightCarrusel from "./icons/ArrowRightCarrusel";

const Carrusel = ({
  items,
  onItemClick,
  type,
  selectedItem,
  onBookClick,
  disableItemClic = false,
}) => {

  console.log("📌 Props en Carrusel:", { onBookClick });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);

  const nameKey =
    type === "sagas" ? "saga" : type === "starwars" ? "titulo" : "genero";
  const coverKey =
    type === "sagas"
      ? "coverSaga"
      : type === "starwars"
      ? "cover"
      : "coverGenero";

  const handlePrev = () => {
    const newIndex =
      currentIndex === 0 ? items.length - visibleItems : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex =
      currentIndex >= items.length - visibleItems ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const updateVisibleItems = useCallback(() => {
    const width = window.innerWidth;
    if (width < 1060) {
      setVisibleItems(1);
    } else if (width < 1400) {
      setVisibleItems(2);
    } else {
      setVisibleItems(3);
    }
  }, []);

  useEffect(() => {
    updateVisibleItems();
    window.addEventListener("resize", updateVisibleItems);
    return () => {
      window.removeEventListener("resize", updateVisibleItems);
    };
  }, [updateVisibleItems]);

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
        className={`${style.arrow} ${isPrevDisabled ? style.disabled : ""}`}
      />
      <div className={style.carrusel}>
        {items
          .slice(currentIndex, currentIndex + visibleItems)
          .map((item, index) => (
            <div
              key={index}
              className={`${style.sagaItem} ${
                selectedItem?.id === item.id ? style.selected : ""
              }`}
              onClick={() => {
                console.log(`${type} clickeado: ${item[nameKey]}`);
                if (!disableItemClic) {
                  onItemClick(item);
                }
                if (onBookClick) {
                  console.log("✅ onBookClick llamado con:", item);
                  onBookClick(item);
                } else {
                  console.error("❌ onBookClick NO está definido en Carrusel.jsx");
                }
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
        className={`${style.arrow} ${isNextDisabled ? style.disabled : ""}`}
      />
    </div>
  );
};

export default Carrusel;
