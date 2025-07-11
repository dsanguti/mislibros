import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom"; // Importa Navigate
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./index.css";

import Login from "./assets/components/autenticacion/Login.jsx"; // Asegúrate de que esta ruta sea correcta
import ResetPasswordForm from "./assets/components/autenticacion/ResetPasswordForm.jsx";
import { useAuth } from "./assets/components/autenticacion/UseAuth.jsx"; // Importa el hook de autenticación
import { ThemeProvider } from "./assets/components/context/ThemeContext";
import Loader from "./assets/components/Loader";
import Nav from "./assets/components/Nav";
import Pagina404 from "./assets/components/Pagina404";
import Tittle from "./assets/components/Tittle";

const Home = lazy(() => import("./assets/components/secciones/home/Home.jsx"));
const Comics = lazy(() =>
  import("./assets/components/secciones/comics/Comics.jsx")
);
const Generos = lazy(() =>
  import("./assets/components/secciones/generos/Generos.jsx")
);
const Sagas = lazy(() =>
  import("./assets/components/secciones/sagas/Sagas.jsx")
);
const Starwars = lazy(() =>
  import("./assets/components/secciones/starwars/Starwars.jsx")
);
const Gestor = lazy(() =>
  import("./assets/components/secciones/gestor/Gestor.jsx")
);
const EditBooks = lazy(() =>
  import("./assets/components/secciones/gestor/EditBooks.jsx")
);
const AddBook = lazy(() =>
  import("./assets/components/secciones/gestor/AddBook.jsx")
);
const EditSagas = lazy(() =>
  import("./assets/components/secciones/gestor/EditSagas.jsx")
);

const Admin = lazy(() =>
  import("./assets/components/secciones/admin/Admin.jsx")
);

function App() {
  const { isAuthenticated, loading } = useAuth(); // Usa el hook de autenticación
  const location = useLocation(); //obtener la ubicación actual.

  console.log("=== App.jsx - Estado de autenticación ===");
  console.log("isAuthenticated:", isAuthenticated);
  console.log("loading:", loading);
  console.log("location:", location.pathname);

  if (loading) {
    console.log("Mostrando Loader...");
    return <Loader />;
  }

  return (
    <ThemeProvider>
      <ToastContainer />
      <div className="container-app">
        {/* Renderiza el título solo si está autenticado */}
        {isAuthenticated && <Tittle>Mis Libros</Tittle>}

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
                    path="/reset-password"
                    element={<ResetPasswordForm />}
                  />{" "}
                  {/* Ruta para cambiar contraseña*/}
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
                  <Route path="/generos" element={<Generos />} />
                  <Route path="/starwars" element={<Starwars />} />
                  <Route path="/comics" element={<Comics />} />
                  <Route path="/gestor" element={<Gestor />} />
                  <Route path="/editorlibros" element={<EditBooks />} />
                  <Route path="/addlibros" element={<AddBook />} />
                  <Route path="/editsagas" element={<EditSagas />} />
                  <Route path="/admin" element={<Admin />} />
                </>
              )}
              <Route path="/*" element={<Pagina404 />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
