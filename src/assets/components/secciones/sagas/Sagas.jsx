import style from "../../../css/Sagas.module.css"
import HeaderSaga from "./HeaderSaga";

const Sagas = () => {
  return (
    <>
      <div className={style.container}>
        <div className={style.header}>
          <HeaderSaga />
        </div>
        <div className={style.main}>
          <h1>main</h1>
        </div>
      </div>
    </>
  );
};

export default Sagas;
