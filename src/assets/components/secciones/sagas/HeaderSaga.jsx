import Carrusel from "../../Carrusel";

const HeaderSaga = ({ sagas, error }) => {
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
    
      {/* Pasa las sagas a tu componente Carrusel */}
      <Carrusel sagas={sagas} />
    </div>
  );
};

export default HeaderSaga;
