import { useEffect, useState } from "react";
import style from "../../../css/Sagas.module.css";
import CardBook from "../../CardBook";
import MainComics from "./MainComics";
import Modal from "../../Modal"; 
import HeaderComics from "./HeaderComics";

const Comics = () => {
  const [comics, setComics] = useState([]);
  const [selectedComics, setSelectedComics] = useState(null);
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
    const fetchComics = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("No se encontró el token de autenticación");
          return;
        }

        const response = await fetch("http://localhost:8001/api/librosComics", {
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
          setError("Error al obtener los Comics");
          console.error("Error en la solicitud:", errorData);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setComics(data);
        } else {
          setError("Los datos no son un array válido");
          console.error("Datos inválidos:", data);
        }
      } catch (error) {
        setError("Error al obtener los comics");
        console.error("Error:", error);
      }
    };

    if (comics.length === 0) {
      fetchComics();
    }
  }, [comics.length]);
  useEffect(() => {
    console.log("🎯 Estado actualizado de selectedBook:", selectedBook);
  }, [selectedBook]);
  

  const handleComicsClick = (selected) => {
    console.log("Elemento seleccionado en Comics.jsx:", selected);
    if (!selected || !selected.id) {
      console.error("Error: el elemento seleccionado no tiene ID válido", selected);
      return;
    }
    setSelectedComics(selected);
   
  };

  const handleBookClick = (book) => {
    console.log("Libro seleccionado en Comics.jsx:", book);

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
            <HeaderComics
              className={style.header}
              comics={comics}
              selectedComics={selectedComics}
              onComicsClick={handleComicsClick}
              onBookClick={handleBookClick}
            />
            <MainComics
              className={style.main}
              comics={comics} // Pasamos los libros a MainComics
              selectedComics={selectedComics}
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

export default Comics;