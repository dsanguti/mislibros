import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom"; // Importa Navigate
import "./App.css";
import "./index.css";

import Loader from "./assets/components/Loader";
import Nav from "./assets/components/Nav";
import Pagina404 from "./assets/components/Pagina404";
import Tittle from "./assets/components/Tittle";
import Login from "./assets/components/autenticacion/Login.jsx"; // Asegúrate de que esta ruta sea correcta
import { useAuth } from "./assets/components/autenticacion/UseAuth.jsx"; // Importa el hook de autenticación

const Home = lazy(() => import("./assets/components/Home.jsx"));
const Comics = lazy(() => import("./assets/components/Comics.jsx"));
const Generos = lazy(() => import("./assets/components/Generos.jsx"));
const Sagas = lazy(() => import("./assets/components/Sagas.jsx"));
const Starwars = lazy(() => import("./assets/components/Starwars.jsx"));

function App() {
  const { isAuthenticated, loading } = useAuth(); // Usa el hook de autenticación
  const location = useLocation(); //obtener la ubicación actual.

  if(loading){
    return <Loader />;
  }

  return (
    <>
      <div className="container-app">
        <Tittle> Mis Libros</Tittle>

        <div className="container-nav">
          {isAuthenticated && <Nav />}{" "}
          {/* Renderiza Nav solo si está autenticado */}
        </div>
        <div className="container-contenido">
          <Suspense fallback={<Loader />}>
            <Routes>
              {!isAuthenticated ? ( // Si no está autenticado, muestra la página de login
                <>
                  <Route path="/login" element={<Login />} />{" "}
                  {/* Ruta explícita al login*/}
                  <Route
                    path="*"
                    element={
                      <Navigate
                        to="/login"
                        state={{ from: location }}
                        replace
                      />
                    }
                  />{" "}
                  {/* Redirige a Login si no está autenticado*/}
                </>
              ) : (
                // Si está autenticado, muestra las rutas principales
                <>
                  <Route path="/" element={<Home />} />
                  <Route path="/sagas" element={<Sagas />} />
                  <Route path="/comics" element={<Comics />} />
                  <Route path="/generos" element={<Generos />} />
                  <Route path="/starwars" element={<Starwars />} />
                </>
              )}
              <Route path="/*" element={<Pagina404 />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </>
  );
}

export default App;
