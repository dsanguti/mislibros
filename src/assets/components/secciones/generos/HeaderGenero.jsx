import Carrusel from "../../Carrusel";

const HeaderGenero = ({ generos, onGeneroClick }) => {
  const handleGeneroClick = (genero) => {
    console.log(`Género clickeado en HeaderGenero: ${genero.nombre}`);
    onGeneroClick(genero);
  };

  return (
    <div>
      <Carrusel items={generos} onItemClick={handleGeneroClick} type="generos" />
    </div>
  );
};

export default HeaderGenero;

