import Carrusel from "../../Carrusel";

const HeaderSaga = ({ sagas, onSagaClick }) => {
  const handleSagaClick = (saga) => {
    console.log(`Saga seleccionada en HeaderSaga: ${saga.saga}`); // Añadido para depuración
    onSagaClick(saga);
  };

  return (
    <div>
      <Carrusel sagas={sagas} onSagaClick={handleSagaClick} />
    </div>
  );
};

export default HeaderSaga;
