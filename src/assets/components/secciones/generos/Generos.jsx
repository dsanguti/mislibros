import { useEffect, useState } from "react";
import HeaderGenero from "./HeaderGenero";
import MainGenero from "./MainGenero";
import CardBook from "../../CardBook";
import Modal from "../../Modal";
import style from "../../../css/Genero.module.css";

const Generos = () => {
  const [generos, setGeneros] = useState([]);
  const [selectedGenero, setSelectedGenero] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState(null);

  const isMobile = window.innerWidth <= 768;
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const response = await fetch("http://localhost:8001/api/generos", {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener géneros");
        }

        const data = await response.json();
        console.log("🎨 Géneros cargados:", data);
        setGeneros(data);
      } catch (err) {
        console.error("Error al cargar géneros:", err);
        setError("Error al cargar géneros.");
      }
    };

    fetchGeneros();
  }, []);

  const handleGeneroClick = (genero) => {
    console.log("🎯 Género seleccionado en Generos.jsx:", genero);
    setSelectedGenero(genero);
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
    if (isMobile) setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  return (
    <div className={style.container}>
      {error ? (
        <p className={style.error}>{error}</p>
      ) : (
        <>
          <div className={style.ContainerHeaderMain}>
            <HeaderGenero
              className={style.header}
              generos={generos}
              onGeneroClick={handleGeneroClick}
            />
            <MainGenero
              className={style.main}
              genero={selectedGenero}
              onBookClick={handleBookClick}
            />
          </div>

          {isMobile ? (
            <Modal isOpen={isModalOpen} onClose={closeModal}>
              {selectedBook && <CardBook book={selectedBook} />}
            </Modal>
          ) : (
            <div className={style.containerCard}>
              {selectedBook ? (
                <CardBook book={selectedBook} />
              ) : (
                <p>Seleccione un libro</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Generos;
