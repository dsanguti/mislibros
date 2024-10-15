import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";

import Loader from "./assets/components/Loader";
import Nav from "./assets/components/Nav";
import Pagina404 from "./assets/components/Pagina404";

import Tittle from "./assets/components/Tittle";

const Home = lazy(() => import("./assets/components/Home.jsx"));
const Comics = lazy(() => import("./assets/components/Comics.jsx"));
const Generos = lazy(() => import("./assets/components/Generos.jsx"));
const Sagas = lazy(() => import("./assets/components/Sagas.jsx"));
const Starwars = lazy(() => import("./assets/components/Starwars.jsx"));

function App() {
  return (
    <>
      <div className="container-app">
        <Tittle> Mis Libros</Tittle>

        <div className="container-nav">
          <Nav />
        </div>
        <div className="container-contenido">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sagas" element={<Sagas />} />
              <Route path="/comics" element={<Comics />} />
              <Route path="/generos" element={<Generos />} />
              <Route path="/starwars" element={<Starwars />} />
              <Route path="/*" element={<Pagina404 />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </>
  );
}

export default App;
