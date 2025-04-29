import { useNavigate } from "react-router-dom";
import style from "../../../css/Gestor.module.css";
import AddBook from "../../icons/AddBook";
import EditBook from "../../icons/EditBook";
import GestorCard from "./GestorCard";
import Sagas_Icon from "../../icons/Sagas_Icon";

const Gestor = () => {
  const navigate = useNavigate();
  const handleEditBooksClick = () => {
    navigate("/editorlibros");
  };

  const handleAddBookClick = () => {
    navigate("/addlibros");
  };

  const handleEditSagasClick = () => {
    navigate("/editsagas");
  };

  return (
    <>
      <div className={style.container}>
        <div className={style.tittle}>
          <h3>Gestor de libros</h3>
          <p>
            ¿Quiere añadir más libros a su biblioteca? ¿Necesita crear alguna
            Saga? o quizá necesite editar o eliminar algún libro... puede
            gestionarlo aquí.
          </p>
        </div>
        <div className={style.sectionCards}>
          <GestorCard
            icon={AddBook}
            description="Añada un nuevo libro a su biblioteca"
            onClick={handleAddBookClick}
          />
          <GestorCard
            icon={EditBook}
            description="Edite o elimine los libros de su biblioteca"
            onClick={handleEditBooksClick}
          />
          <GestorCard
            icon={Sagas_Icon}
            description="Cree o edite las sagas de sus libros"
            onClick={handleEditSagasClick}
          />
        </div>
      </div>
    </>
  );
};

export default Gestor;
