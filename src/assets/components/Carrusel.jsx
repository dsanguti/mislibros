import { useCallback, useEffect, useState } from "react";
import style from "../css/Carrusel.module.css";
import ArrowLeftCarrusel from "./icons/ArrowLeftCarrusel";
import ArrowRightCarrusel from "./icons/ArrowRightCarrusel";

const Carrusel = ({
  items,
  onItemClick,
  type,
  selectedItem,
  disableItemClic = false,
}) => {

  // Para depuración, si es necesario
  console.log("📌 Props en Carrusel:", { onItemClick });
  console.log("Imágenes en carrusel:", items.map(item => item.coverGenero));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);

  // Determinar qué propiedad usar según el tipo (sagas, géneros, starwars, etc.)
  const nameKey =
    type === "sagas"
      ? "nombre"
      : type === "starwars" || type === "comics"
      ? "titulo"
      : "nombre"; // Para género
  const coverKey =
    type === "sagas"
      ? "coverSaga"
      : type === "starwars" || type === "comics"
      ? "cover"
      : "coverGenero";

  // Funciones para controlar el desplazamiento en el carrusel
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

  // Actualizar la cantidad de elementos visibles según el tamaño de la ventana
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

  // Si los items no son válidos, mostramos un error
  if (!Array.isArray(items)) {
    return <p>Error: los datos no son válidos</p>;
  }

  // Comprobaciones para deshabilitar los botones de desplazamiento
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
