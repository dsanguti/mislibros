import Carrusel from "../../Carrusel";

const HeaderComics = ({ comics, selectedComics, onComicsClick, onBookClick }) => {

  const handleComicsClick = (comics) => {
    onComicsClick(comics);
  };

  return (
    <div>
      <Carrusel 
        items={comics} 
        onItemClick={handleComicsClick} // Selecciona la saga
        type="comics" 
        selectedItem={selectedComics} // Pasamos el seleccionado
        onBookClick={onBookClick}  // Pasamos el manejador de clic en libro
        disableItemClic={true}
      />
    </div>
  );
};

export default HeaderComics;