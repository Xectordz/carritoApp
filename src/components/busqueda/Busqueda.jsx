import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import img from "../../../public/tv.jpg";
import { MdAddShoppingCart } from "react-icons/md";
import { BiLike } from "react-icons/bi";
import { FaSpinner } from "react-icons/fa6";
import styles from "../busqueda/busqueda.module.css";
import Modal from '../modal/Modal';
import { MdGridView } from "react-icons/md";
import { MdOutlineViewAgenda } from "react-icons/md";
import { useCarrito } from '../../context/CarritoContext';
import { BsArrowReturnLeft } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import elote from "../../../public/elote.jpg";
import cebolla from "../../../public/cebolla.webp";
import chile from "../../../public/chile.jpg";
import limon from "../../../public/limon.png";
import tomate from "../../../public/tomate.jpg";
import pepino from "../../../public/pepino.jpg";



export default function Busqueda() {
    const { alerta, handleAgregar, view, setView, apiURL } = useCarrito();
    const [articulos, setArticulos] = useState([]);
    const [filtrados, setFiltrados] = useState([]);
    const { searchTerm } = useParams();
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [articuloCarrito, setArticuloCarrito] = useState([]);
    const [alertaModal, setAlertaModal] = useState(false);
    const [ordenarPor, setOrdenarPor] = useState(false);
    const navigate = useNavigate();
    const [lotesArticulos ,setLotesArticulos] = useState([]);
    const ordenarRef = useRef(null);
    const [cantidad, setCantidad] = useState(1);
    const [notas, setNotas] = useState("");
    const [precioArticulo, setPrecioArticulo] = useState(10);
    const [descuento, setDescuento] = useState(0);
    const [total, setTotal] = useState(0);

    /*funcion que calcula el precio de
    articulo por su cantidad*/
    useEffect(() => {
      const precioConDescuento = precioArticulo - (precioArticulo * (descuento / 100));
      setTotal(precioConDescuento * cantidad); // Calcular el total
  }, [cantidad, precioArticulo, descuento]);

    /*fetch de los articulos y se almacenan en 
      la variable de estado articulos*/
    useEffect(() => {
        setLoading(true);
        const fetchArticulos = async () => {
            try {
              const res = await fetch(`${apiURL}/get_catalogos_json/articulos`);
              const data = await res.json();
              setArticulos(data);
            } catch(error) {
              console.log("Error al obtener los articulos:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchArticulos();
        
      }, []);

    /*filtra todos los articulos que contienen el
      parametro de la busqueda, del array que contiene todos,
      y guarda los filtrados en la variable filtrados*/
    useEffect(()=>{
        const resultados = articulos.filter( articulo => 
          articulo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFiltrados(resultados);
    }, [articulos, searchTerm]);


    // Manejar clics fuera del menú
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (ordenarRef.current && !ordenarRef.current.contains(event.target)) {
            setOrdenarPor(null);
        }
    };

    // Escuchar clics en el documento
    document.addEventListener('mousedown', handleClickOutside);
    
    // Limpiar el evento al desmontar el componente
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [ordenarRef]);


    useEffect(() => {
      if (modal) {
        document.body.style.overflow = 'hidden'; // Bloquea el scroll
      } else {
        document.body.style.overflow = 'unset'; // Restaura el scroll
      }
    }, [modal]);


    /*funcion para activar el modal 
    del articulo*/
    const handleModal = (articulo, precio) => {
      setModal(true);
      setArticuloCarrito({
        ...articulo,
        imagen: cargarImagen(articulo),
        descripcion: cargarDesc(articulo),
      });
      setPrecioArticulo(articulo.preciolista || precio);
    };

    /*Esta funcion agrega un articulo
    desde la vista general, sin necesidad
    de adentrarse al articulo*/
    const handleAgregarArticulos = (articulo) => {
      const itemToAdd = ({ ...articulo, cantidad, notas, precioArticulo, descuento });
      handleAgregar(itemToAdd);
    }


    /*funcion para agregar al carrito desde
    el modal del articulo*/
    const handleSubmit = (e) => {
      e.preventDefault();
      if (cantidad <= 0) {
        setAlertaModal("Cantidad no puede ir vacío");
        setTimeout(() => {
          setAlertaModal(null);
        }, 2000);
        return;
      }else if(precioArticulo === "" || precioArticulo < 1){
        setAlertaModal("Precio no puede ir vacío");
        setTimeout(() => {
          setAlertaModal(null);
        }, 2000);
        return;
      }else if(descuento === ""){
        setAlertaModal("Descuento no puede ir vacío");
        setTimeout(() => {
          setAlertaModal(null);
        }, 2000);
        return;
      }else if(isNaN(cantidad) || isNaN(descuento) || isNaN(precioArticulo)){
        setAlertaModal("Los valores ingresados deben ser numeros");
        setTimeout(() => {
          setAlertaModal(null);
        }, 2000);
        return;
      }
      
      const itemToAdd = { 
        ...articuloCarrito, 
        cantidad, 
        "cantGlobal": cantidad,
        notas,
        precioArticulo,
        descuento, 
        lotesArticulos
      };
      setLotesArticulos([]);
      handleAgregar(itemToAdd);
      setModal(false);
      setNotas("");
      setCantidad(1);
      setDescuento(0);
      setPrecioArticulo(10);
      console.log(itemToAdd);
    };

    const closeModal = () => {
      setModal(false);
      setPrecioArticulo(10);
      setCantidad(1);
    };


    const handleOrdenar = (orden) => {
      // Crear una copia de filtrados para no modificar el array original
      const copiaFiltrados = [...filtrados];
      let ordenados;
    
      // Ordenar por precio (menor a mayor)
      if (orden === "menor") {
        ordenados = copiaFiltrados.sort((a, b) => {
          return a.preciolista - b.preciolista;  // Asegúrate de que ambos objetos tienen la propiedad "preciolista"
        });
        console.log("ordenados menor a mayor");
        setOrdenarPor(false);
    
      // Ordenar por precio (mayor a menor)
      } else if (orden === "mayor") {
        ordenados = copiaFiltrados.sort((a, b) => {
          return b.preciolista - a.preciolista;  // Asegúrate de que ambos objetos tienen la propiedad "preciolista"
        });
        console.log("ordenados mayor a menor");
        setOrdenarPor(false);
    
      // Ordenar por nombre de A a Z
      } else if (orden === "az") {
        ordenados = copiaFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
        console.log("ordenados de A a Z");
        setOrdenarPor(false);
    
      // Ordenar por nombre de Z a A
      } else if (orden === "za") {
        ordenados = copiaFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
        console.log("ordenados de Z a A");
        setOrdenarPor(false);
      }
    
      setFiltrados(ordenados);
    }
    

    const cargarImagen = (articulo) => {
      if(articulo.lineaarticuloid === 623 || articulo.lineaarticuloid === 1300){
        return cebolla;
      }else if(articulo.lineaarticuloid === 627 || articulo.lineaarticuloid === 628 || articulo.lineaarticuloid === 629 || articulo.lineaarticuloid === 687 || articulo.lineaarticuloid === 5262 || articulo.nombre.includes("CHILE") || articulo.nombre.includes("chile")){
        return chile;
      }else if(articulo.lineaarticuloid === 624 || articulo.lineaarticuloid === 625 || articulo.lineaarticuloid === 9306 || articulo.nombre.includes("TOMATE")){
        return tomate;
      }else if(articulo.lineaarticuloid === 626 || articulo.nombre.includes("LIMON")){
        return limon;
      }else if(articulo.lineaarticuloid === 630 || articulo.nombre.includes("PEPINO")){
        return pepino;
      }else if(articulo.lineaarticuloid === 631 || articulo.nombre.includes("ELOTE")){
        return elote;
      }
      else{
        return img;
      }
    }

    const cargarDesc = (articulo) => {
      if(articulo.lineaarticuloid === 623 || articulo.lineaarticuloid === 1300){
        return "Disfruta de la frescura y sabor único de nuestra cebolla, ideal para dar un toque delicioso y crujiente a tus platillos. Perfecta para ensaladas, guisos y mucho más. ¡Agrégala a tu cocina y mejora cada receta!";
      }else if(articulo.lineaarticuloid === 627 || articulo.lineaarticuloid === 628 || articulo.lineaarticuloid === 629 || articulo.lineaarticuloid === 687 || articulo.lineaarticuloid === 5262){
        return "Añade un toque de picante y sabor a tus comidas con nuestro chile fresco. Perfecto para darle vida a salsas, tacos y guisos. ¡Haz que cada bocado sea una explosión de sabor!";
      }else if(articulo.lineaarticuloid === 624 || articulo.lineaarticuloid === 625 || articulo.lineaarticuloid === 9306){
        return "Refresca tus platillos con el sabor jugoso y natural de nuestro tomate. Ideal para ensaladas, salsas y guisos. ¡Un ingrediente esencial para resaltar el sabor de tus recetas!";
      }else if(articulo.lineaarticuloid === 626){
        return "Agrega frescura y un toque ácido con nuestro limón fresco. Perfecto para aderezos, bebidas y dar ese sabor vibrante a tus platillos. ¡El toque ideal para cualquier receta!";
      }else if(articulo.lineaarticuloid === 630){
        return "Disfruta de la frescura y crocancia de nuestro pepino. Ideal para ensaladas, bocadillos y jugos. ¡Un ingrediente refrescante que aporta sabor y nutrición a tus comidas!";
      }else if(articulo.lineaarticuloid === 631){
        return "Disfruta del sabor dulce y tierno de nuestro elote fresco. Perfecto para asar, hervir o agregar a tus platillos favoritos. ¡Una delicia que realza cualquier comida!";
      }else{
        return "Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis veritatis est saepe minus, sequi asperiores corrupti nam quia deserunt amet cumque, eveniet cupiditate consequatur! Maiores nam impedit voluptates obcaecati animi!"
      }
    }

  return (
    <>
      <div className={styles.container}>
        {
          loading ? (

              <div className={styles.div_cargando}>
                  <p className={styles.cargando}><FaSpinner /></p>
                  <p>Cargando articulos...</p>
              </div>

          ) : (
            <>

              <h3>Resultados de busqueda</h3>
              <div className={`alerta ${alerta ? "mostrar" : ""}`}>
                Agregado <span><BiLike /></span>
              </div>

              <div className={ view.grid ? "productos_contenedor" : "productos_contenedor_row"}>
                
              <div className={styles.views_contenedor}>
              <div className={`${styles.views}`}>
                  <div className={view.grid ? styles.active : ""} onClick={()=>{
                      setView({ grid: true, row: false })
                  }}
                  >
                      <MdGridView/>
                  </div>
                  <div className={view.row ? styles.active : ""} onClick={()=>{
                      setView({ grid: false, row: true })
                  }}>
                      <MdOutlineViewAgenda/>
                  </div>
              </div>
              <div className={styles.ordenar}>
              <p onClick={()=>setOrdenarPor(prev=>!prev)}>Ordenar por </p>
                <div ref={ordenarRef} className={`ordenar_container ${ordenarPor ? "mostrar_ordenar" : ""}`}>
                    {
                      ordenarPor && (
                        <div>
                            <p onClick={()=> handleOrdenar("menor")}>Precio(menor a mayor)</p>
                            <p onClick={()=> handleOrdenar("mayor")}>Precio(mayor a menor)</p>
                            <p onClick={()=> handleOrdenar("az")}>Nombre(A a Z)</p>
                            <p onClick={()=> handleOrdenar("za")}>Nombre(Z a A)</p>
                        </div>
                      )
                    }
                </div>
              </div>
              
              </div>

                  {
                    filtrados.length > 0 ? (
                      filtrados.map(( articulo, index )=>(

                        <div onClick={() => handleModal(articulo, precioArticulo)} className={view.grid ? "producto_contenedor" : "producto_contenedor_row"} key={index}>
                            <p className={view.row ? "producto_nombre_row" : "producto_nombre"}>{articulo.nombre}</p>
                            <div className={view.row ? "div_flex" : ""}>
                                <div className={view.row ? "" : ""}>
                                    <img className={view.grid ? "producto_imagen" : "producto_imagen_row"} src={cargarImagen(articulo)} alt="" />
                                </div>
                                <div className={styles.div_info}>
                                    <p className={`producto_precio`}>Precio: $ {articulo.preciolista || precioArticulo}</p>
                                    <p className={`producto_descuento`}>Descuento: {`${descuento} %`}</p>
                                    <button onClick={(e)=>{
                                        e.stopPropagation();
                                        //handleAgregarArticulos(articulo);
                                        setModal(true);
                                    }}
                                    >
                                        {/*Agregar <span><MdAddShoppingCart/></span>*/}
                                      Ver mas
                                    </button>
                                </div>
                            </div>
                            
                                {
                                  view.row && (
                                    <div className="div_descripcion">
                                        <p>{cargarDesc(articulo)}</p>
                                    </div>
                                  )
                                }
            
                        </div>

                      ))
                    ) : (
                      
                      <p className={styles.no_disponibles}>No se encontraron resultados para esa busqueda, intenta de nuevo</p>
                      
                    )
                  }
              </div>

            </>
          )
        }
      </div>


      {modal && (
        <Modal
          articuloCarrito={articuloCarrito}
          handleSubmit={handleSubmit}
          closeModal={closeModal}
          alertaModal={alertaModal}
          lotesArticulos={lotesArticulos}
          setLotesArticulos={setLotesArticulos}
          setCantidad={setCantidad}
          cantidad={cantidad}
          setNotas={setNotas}
          notas={notas}
          precioArticulo={precioArticulo}
          setPrecioArticulo={setPrecioArticulo}
          descuento={descuento}
          setDescuento={setDescuento}
          total={total}
        />
      )}


    </>

  )
}
