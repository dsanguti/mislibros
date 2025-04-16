import Carrusel from "../../Carrusel";

const HeaderComics = ({ comics, onBookClick }) => {
  return (
    <div>
      <Carrusel 
        items={comics}
        type="comics"
        onBookClick={onBookClick}  // Manejador para mostrar el libro
      />
    </div>
  );
};

export default HeaderComics;
