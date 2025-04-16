import Carrusel from "../../Carrusel";

const HeaderStarwars = ({ starwars, onBookClick }) => {
  return (
    <div>
      <Carrusel 
        items={starwars}
        type="starwars"
        onBookClick={onBookClick}  // Manejador para mostrar el libro
      />
    </div>
  );
};

export default HeaderStarwars;

