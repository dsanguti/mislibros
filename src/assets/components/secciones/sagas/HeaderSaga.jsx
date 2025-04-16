import Carrusel from "../../Carrusel";

const HeaderSaga = ({ sagas, onSagaClick }) => {
  const handleSagaClick = (saga) => {
    console.log(`Saga seleccionada en HeaderSaga: ${saga.titulo}`); // Usar 'titulo' en lugar de 'saga'
    onSagaClick(saga);
  };
  

  return (
    <div>
     <Carrusel items={sagas} onItemClick={handleSagaClick} type="sagas" />
    </div>
  );
};

export default HeaderSaga;

