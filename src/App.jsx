import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Nav from './components/nav/Nav';
import Grupos from './components/grupos/Grupos';
import Menu from './components/menu/Menu';
import Carrito from "./components/carrito/Carrito";
import Lineas from './components/lineas/Lineas';
import Articulos from "./components/articulos/Articulos";
import Busqueda from './components/busqueda/Busqueda';
import { CarritoProvider } from "./context/CarritoContext";
import Inicio from "./components/inicio/Inicio";
import { FaArrowUp } from "react-icons/fa";
import Todos from './components/todos/Todos'
import Login from './components/login/Login';
import OrdenCompra from './components/ordenCompra/OrdenCompra';
import { useCarrito } from './context/CarritoContext';


function App() {
  return (
    <CarritoProvider>
      <Router>
        <Main />
      </Router>
    </CarritoProvider>
  );
}

const Main = () => {
  const location = useLocation();
  const [activeComponent, setActiveComponent] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [redirectLogin, setRedirectLogin] = useState(false);
  const { setCarrito } = useCarrito();

  
  useEffect(() => {
    const existeCliente = localStorage.getItem("existeCliente") === "true";
    const existeUsuario = localStorage.getItem("existeUsuario") === "true";
    
    // Si no hay usuario, redirigir a /login
    if (!existeUsuario) {
      setRedirectLogin(location.pathname !== "/login");
    } else {
      setRedirectLogin(false);
      // Si hay usuario pero no hay cliente, redirigir a /
      if (!existeCliente) {
        setRedirect(location.pathname !== "/");
      } else {
        setRedirect(false);
      }
    }
  }, [location.pathname]);

  if (redirectLogin) {
    return <Navigate to="/login" replace />;
  } else if (redirect) {
    return <Navigate to="/" replace />;
  }

  return (

    <>
    
      <Nav 
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
      />

      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path="/" element={<Inicio />} />
        <Route path="/ordenCompra" element={<OrdenCompra />} />
        <Route path="/grupos" element={<Grupos />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/lineas" element={<Lineas />} />
        <Route path="/articulos" element={<Articulos />} />
        <Route path="/busqueda/results/:searchTerm" element={<Busqueda />} />
      </Routes>

    </>
    
  );
};

export default App;





