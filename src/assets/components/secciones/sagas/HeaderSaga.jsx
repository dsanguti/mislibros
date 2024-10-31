import { useEffect, useState } from "react";
import Carrusel from "../../Carrusel";


const HeaderSaga =()=>{const [libros, setLibros] = useState([]);

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        const response = await fetch('http://localhost/backendMisLibros/api/libros.php?saga=El Señor de los Anillos');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setLibros(data);
      } catch (error) {
        console.error('Error al obtener libros:', error);
      }
    };

    fetchLibros();
  }, []);

  return libros.length > 0 ? <Carrusel libros={libros} /> : <p>Cargando libros...</p>;
};


export default HeaderSaga;