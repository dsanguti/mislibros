import { useNavigate } from "react-router-dom";
import style from "../../../css/Gestor.module.css";
import GestorCard from "./GestorCard";
import EditBook from "../../icons/EditBook"
import AddBook from "../../icons/AddBook"

const Gestor = () => {

const navigate = useNavigate();
const handleEditBooksClick =()=>{
  navigate("/editorlibros");
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
        <GestorCard icon={AddBook} description="Añada un nuevo libro a su biblioteca" />
        <GestorCard icon={EditBook} description="Edite o elimine los libros de su biblioteca"
        onClick={handleEditBooksClick} />
       
        </div>
      </div>
    </>
  );
};

export default Gestor;
