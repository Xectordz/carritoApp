import React, { useState, useEffect, useRef } from 'react';
import styles from "../articulos/articulos.module.css";
/*hooks de react router*/
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
/*iconos de react icons*/
import { MdAddShoppingCart } from "react-icons/md";
import { BiLike } from "react-icons/bi";
import { FaSpinner } from "react-icons/fa6";
import { MdGridView } from "react-icons/md";
import { MdOutlineViewAgenda } from "react-icons/md";
/*imagen de prueba*/
import img from "../../../public/tv.jpg";
/*componente de Modal*/
import Modal from "../modal/Modal";
/*contexto de carrito*/
import { useCarrito } from '../../context/CarritoContext';
import useGrupoLinea from "../../customHook/useGrupoLinea"
import elote from "../../../public/elote.jpg";
import cebolla from "../../../public/cebolla.webp";
import chile from "../../../public/chile.jpg";
import limon from "../../../public/limon.png";
import tomate from "../../../public/tomate.jpg";
import pepino from "../../../public/pepino.jpg";



/*Componente Articulos*/
export default function Articulos() {
  const { lineaId } = useGrupoLinea();
  const { alerta, handleAgregar, view, setView, apiURL, setCarrito } = useCarrito(); // extraccion de variables o funciones reciclables del contecto carrito
  //const { lineaId } = useParams(); // extraccion del parametro pasado de la ruta anterior que contiene el id de la linea
  const [loading, setLoading] = useState(true); // variable local de loading
  const [articulos, setArticulos] = useState([]); // variable donde se almacenaran los articulos ya filtrados que coinciden con el id de lineas
  const [articuloCarrito, setArticuloCarrito] = useState({}); //variable para pasarle el objeto del articulo seleccionado al modal y de ahi mostrar sus datos
  const [modal, setModal] = useState(false); // variable mara activar o desactivar el modal
  const [alertaModal, setAlertaModal] = useState(null);//variable para activar o desactivar alerta de modal
  const [ordenarPor, setOrdenarPor] = useState(false); //variable para activar o desactivar las opciones de ordenar articulos
  const navigate = useNavigate();
  const [lotesArticulos, setLotesArticulos] = useState([]);
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


  /*funcion que realiza el fetch de los articulos
    y filtra solo los que coinciden a la linea
    seleccionada*/
  useEffect(() => {
    setLoading(true);
    const fetchArticulos = async () => {
      try {
        const res = await fetch(`${apiURL}/get_catalogos_json/articulos`);
        const data = await res.json();
        if (res.ok) {
          const filteredArticulos = data.filter(articulo => String(articulo.lineaarticuloid) === String(lineaId));
          setArticulos(filteredArticulos);
        } else {
          console.log("hubo un error al obtener los articulos");
        }
      } catch (error) {
        console.log("hubo un problema en la solicitud de grupos", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticulos();
  }, [lineaId]);


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


  /*funcion para activar el modal
    del articulo*/
  const handleModal = (articulo, precio) => {
    setModal(true);
    setArticuloCarrito({
      ...articulo,
      imagen: cargarImagen(articulo),
      descripcion: cargarDesc(articulo)
    });
    setPrecioArticulo(articulo.preciolista || precio);
  };

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
      lotesArticulos,
    };
    setLotesArticulos([]);
    handleAgregar(itemToAdd);
    setModal(false);
    setNotas("");
    setCantidad(1);
    setDescuento(0);
    setPrecioArticulo(10);
  };


  /*Esta funcion agrega un articulo
    desde la vista general, sin necesidad
    de adentrarse al articulo*/
  const handleAgregarArticulos = (articulo) => {
    const itemToAdd = ({ ...articulo, cantidad, notas, precioArticulo, descuento });
    handleAgregar(itemToAdd);
  }

  const closeModal = () => {
    setModal(false);
    setPrecioArticulo(10);
    setCantidad(1);
  };

  useEffect(() => {
    if (modal) {
      document.body.style.overflow = 'hidden'; // Bloquea el scroll
    } else {
      document.body.style.overflow = 'unset'; // Restaura el scroll
    }
  }, [modal]);


  const handleOrdenar = (orden) => {
    // Crear una copia de articulos para no modificar el array original
    const copiaArticulos = [...articulos];
    let ordenados;
  
    // Ordenar por precio (menor a mayor)
    if (orden === "menor") {
      ordenados = copiaArticulos.sort((a, b) => a.preciolista - b.preciolista);
      console.log("ordenados menor a mayor");
      setOrdenarPor(false);
  
    // Ordenar por precio (mayor a menor)
    } else if (orden === "mayor") {
      ordenados = copiaArticulos.sort((a, b) => b.preciolista - a.preciolista);
      console.log("ordenados mayor a menor");
      setOrdenarPor(false);
  
    // Ordenar por nombre de A a Z
    } else if (orden === "az") {
      ordenados = copiaArticulos.sort((a, b) => a.nombre.localeCompare(b.nombre));
      console.log("ordenados de A a Z");
      setOrdenarPor(false);
  
    // Ordenar por nombre de Z a A
    } else if (orden === "za") {
      ordenados = copiaArticulos.sort((a, b) => b.nombre.localeCompare(a.nombre));
      console.log("ordenados de Z a A");
      setOrdenarPor(false);
    }
  
    // Actualiza el estado de articulos con el array ordenado
    setArticulos(ordenados);
  };
  

  const cargarImagen = (articulo) => {
    
    if(articulo.lineaarticuloid === 623 || articulo.lineaarticuloid === 1300){
      return cebolla;
    }else if(articulo.lineaarticuloid === 627 || articulo.lineaarticuloid === 628 || articulo.lineaarticuloid === 629 || articulo.lineaarticuloid === 687 || articulo.lineaarticuloid === 5262){
      return chile;
    }else if(articulo.lineaarticuloid === 624 || articulo.lineaarticuloid === 625 || articulo.lineaarticuloid === 9306){
      return tomate;
    }else if(articulo.lineaarticuloid === 626){
      return limon;
    }else if(articulo.lineaarticuloid === 630){
      return pepino;
    }else if(articulo.lineaarticuloid === 631){
      return elote;
    }else{
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
      return "Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias ut recusandae aperiam eos quas perferendis cum accusantium nihil quibusdam saepe animi accusamus reiciendis quod, culpa consequatur modi quos deserunt maiores!"
    }
  }

console.log(lineaId);

  return (
    <>
      <div className={styles.container}>

        {loading ? (

          <div className={styles.div_cargando}>
            <p className={styles.cargando}><FaSpinner /></p>
            <p>Cargando articulos...</p>
          </div>

        ) : (

          <>
            <h3>Articulos</h3>
            <div className={`${"alerta"} ${alerta && "mostrar"}`}>
              Agregado <span><BiLike /></span>
            </div>

            <div className={view.grid ? "productos_contenedor" : "productos_contenedor_row"}>
              <div className={styles.views_contenedor}>
                <div className={`${styles.views}`}>
                  <div className={view.grid ? styles.active : ""} onClick={() => {
                    setView({ grid: true, row: false })
                  }}
                  >
                    <MdGridView />
                  </div>
                  <div className={view.row ? styles.active : ""} onClick={() => {
                    setView({ grid: false, row: true })
                  }}>
                    <MdOutlineViewAgenda />
                  </div>
                </div>
                <div className={styles.ordenar}>
                  <p onClick={() => setOrdenarPor(prev => !prev)}>Ordenar por </p>
                  <div ref={ordenarRef} className={`ordenar_container ${ordenarPor ? "mostrar_ordenar" : ""}`}>
                    {
                      ordenarPor && (
                        <div>
                          <p onClick={() => handleOrdenar("menor")}>Precio (menor a mayor)</p>
                          <p onClick={() => handleOrdenar("mayor")}>Precio (mayor a menor)</p>
                          <p onClick={() => handleOrdenar("az")}>Nombre (A a Z)</p>
                          <p onClick={() => handleOrdenar("za")}>Nombre (Z a A)</p>
                        </div>
                      )
                    }
                  </div>
                </div>

              </div>
              {
                articulos.length > 0 ? (
                  articulos.map((articulo, index) => (
                    <div onClick={() => handleModal(articulo, precioArticulo)} className={view.grid ? "producto_contenedor" : "producto_contenedor_row"} key={index}>
                      <p className={view.row ? "producto_nombre_row" : "producto_nombre"}>{articulo.nombre}</p>
                      <div className={view.row ? "div_flex" : ""}>
                        <div className={view.row ? "" : ""}>
                          <img className={view.grid ? "producto_imagen" : "producto_imagen_row"} src={cargarImagen(articulo)} alt="imagen" />
                        </div>
                        <div className={styles.div_info}>
                          <p className={`producto_precio`}>Precio: ${articulo.preciolista || precioArticulo}</p>
                          <p className={`producto_descuento`}>Descuento: {`${descuento} %`}</p>
                          <button onClick={(e) => {
                            e.stopPropagation();
                            //handleAgregarArticulos(articulo);
                            setModal(true);
                          }}>
                            {/*Agregar <span><MdAddShoppingCart /></span>*/}
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
                  <p className={styles.no_disponibles}>No hay artículos disponibles para esta línea.</p>
                )
              }
            </div>
          </>

        )}

      </div>

      {modal && (
        <>
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
        </>
      )}

    </>
  );
}



