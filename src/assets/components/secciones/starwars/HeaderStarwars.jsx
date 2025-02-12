import Carrusel from "../../Carrusel";

const HeaderStarwars = ({ starwars, selectedStarwars, onStarwarsClick, onBookClick }) => {

  const handleStarwarsClick = (starwar) => {
    onStarwarsClick(starwar);
  };

  return (
    <div>
      <Carrusel 
        items={starwars} 
        onItemClick={handleStarwarsClick} // Selecciona la saga
        type="starwars" 
        selectedItem={selectedStarwars} // Pasamos el seleccionado
        onBookClick={onBookClick}  // Pasamos el manejador de clic en libro
        disableItemClic={true}
      />
    </div>
  );
};

export default HeaderStarwars;
