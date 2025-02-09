import Carrusel from "../../Carrusel";

const HeaderGenero = ({ generos, onGeneroClick }) => {

  console.log("Generos recibidos en HeaderGenero:", generos);
  
  const handleGeneroClick = (genero) => {
    console.log(`Saga seleccionada en HeaderSaga: ${genero.genero}`); // Añadido para depuración
    onGeneroClick(genero);
  };

  return (
    <div>
   <Carrusel items={generos} onItemClick={handleGeneroClick} type="generos" />
    </div>
  );
};

export default HeaderGenero;
