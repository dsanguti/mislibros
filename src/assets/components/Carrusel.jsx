import { useState, useEffect } from "react";
import style from "../css/Carrusel.module.css";
import ArrowRightCarrusel from "./icons/ArrowRightCarrusel";
import ArrowLeftCarrusel from "./icons/ArrowLeftCarrusel";

const Carrusel = ({ sagas }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3); // Valor inicial

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? sagas.length - visibleItems : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= sagas.length - visibleItems ? 0 : prevIndex + 1
    );
  };

  // Función para actualizar visibleItems basado en el tamaño de la ventana
  const updateVisibleItems = () => {
    const width = window.innerWidth;
    if (width < 768) { // Pantalla móvil
      setVisibleItems(1);
    } else if (width < 911) { // Pantalla tablet
      setVisibleItems(2);
    } else { // Pantalla grande
      setVisibleItems(3);
    }
  };

  useEffect(() => {
    updateVisibleItems(); // Establecer valor inicial
    window.addEventListener("resize", updateVisibleItems); // Escuchar cambios en el tamaño de la ventana

    return () => {
      window.removeEventListener("resize", updateVisibleItems); // Limpiar el listener al desmontar
    };
  }, []);

  if (!Array.isArray(sagas)) {
    return <p>Error: los datos de sagas no son válidos</p>;
  }

  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex >= sagas.length - visibleItems;

  return (
    <div className={style.container}>
      <ArrowLeftCarrusel
        onClick={handlePrev}
        isDisabled={isPrevDisabled}
        className={`${style.arrow} ${isPrevDisabled ? style.disabled : ''}`} // Aplicar la clase disabled
      />
      <div className={style.carrusel}>
        {sagas.slice(currentIndex, currentIndex + visibleItems).map((saga, index) => (
          <div key={index} className={style.sagaIgem}>
            <img src={saga.coverSaga} alt={saga.saga} />
            <p>{saga.saga}</p>
          </div>
        ))}
      </div>
      <ArrowRightCarrusel
         onClick={handleNext}
         isDisabled={isNextDisabled}
         className={`${style.arrow} ${isNextDisabled ? style.disabled : ''}`} // Aplicar la clase disabled
      />
    </div>
  );
};

export default Carrusel;
