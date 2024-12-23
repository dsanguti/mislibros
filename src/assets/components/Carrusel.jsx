import { useState, useEffect } from "react";
import style from "../css/Carrusel.module.css";
import ArrowRightCarrusel from "./icons/ArrowRightCarrusel";
import ArrowLeftCarrusel from "./icons/ArrowLeftCarrusel";

const Carrusel = ({ sagas, onSagaClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);

  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? sagas.length - visibleItems : currentIndex - 1;
    setCurrentIndex(newIndex);
    loadBooksForCurrentSaga(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex >= sagas.length - visibleItems ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    loadBooksForCurrentSaga(newIndex);
  };

  const loadBooksForCurrentSaga = (index) => {
    const saga = sagas[index];
    if (saga) {
      onSagaClick(saga);
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
        className={`${style.arrow} ${isPrevDisabled ? style.disabled : ''}`}
      />
      <div className={style.carrusel}>
        {sagas.slice(currentIndex, currentIndex + visibleItems).map((saga, index) => (
          <div
            key={index}
            className={style.sagaItem}
            onClick={() => {
              console.log(`Saga clickeada: ${saga.saga}`); // Añadido para depuración
              onSagaClick(saga);
            }}
          >
            <img src={saga.coverSaga} alt={saga.saga} />
            <p>{saga.saga}</p>
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