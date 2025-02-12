import { useEffect, useState } from "react";
import style from "../../../css/Sagas.module.css";
import CardBook from "../../CardBook";
import MainStarwars from "./MainStarwars";
import Modal from "../../Modal"; 
import HeaderStarwars from "./HeaderStarwars";

const StarWars = () => {
  const [starwars, setStarwars] = useState([]);
  const [selectedStarwars, setSelectedStarwars] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchStarwars = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("No se encontró el token de autenticación");
          return;
        }

        const response = await fetch("http://localhost:8001/api/librosStarwars", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError("Error al obtener libros de Star Wars");
          console.error("Error en la solicitud:", errorData);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setStarwars(data);
        } else {
          setError("Los datos no son un array válido");
          console.error("Datos inválidos:", data);
        }
      } catch (error) {
        setError("Error al obtener libros de Star Wars");
        console.error("Error:", error);
      }
    };

    if (starwars.length === 0) {
      fetchStarwars();
    }
  }, [starwars.length]);
  useEffect(() => {
    console.log("🎯 Estado actualizado de selectedBook:", selectedBook);
  }, [selectedBook]);
  

  const handleStarwarsClick = (selected) => {
    console.log("Elemento seleccionado en StarWars.jsx:", selected);
    if (!selected || !selected.id) {
      console.error("Error: el elemento seleccionado no tiene ID válido", selected);
      return;
    }
    setSelectedStarwars(selected);
   
  };

  const handleBookClick = (book) => {
    console.log("Libro seleccionado en StarWars.jsx:", book);

    if (!book || !book.id) {
      console.error("❌ Error: el libro no tiene un ID válido", book);
      return;
    }
    setSelectedBook(book);
    if (isMobile) {
      setModalOpen(true); 
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBook(null);
  };

  return (
    <div className={style.container}>
      {error ? (
        <p className={style.error}>{error}</p>
      ) : (
        <>
          <div className={style.ContainerHeaderMain}>
            <HeaderStarwars
              className={style.header}
              starwars={starwars}
              selectedStarwars={selectedStarwars}
              onStarwarsClick={handleStarwarsClick}
              onBookClick={handleBookClick}
            />
            <MainStarwars
              className={style.main}
              starwars={starwars} // Pasamos los libros a MainStarwars
              selectedStarwars={selectedStarwars}
              onBookClick={handleBookClick}
            />
          </div>
          {isMobile ? (
            <Modal isOpen={isModalOpen} onClose={closeModal}>
              {selectedBook && <CardBook book={selectedBook} />}
            </Modal>
          ) : (
            <div className={style.containerCard}>
              {selectedBook ? <CardBook book={selectedBook} /> : <p>Seleccione un libro</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StarWars;