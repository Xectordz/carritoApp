import React, { useEffect, useState, useRef } from 'react';
import styles from "../modal/modal.module.css";
import { IoMdClose } from "react-icons/io";
import { MdAddShoppingCart } from "react-icons/md";
import { useCarrito } from "../../context/CarritoContext";
import ModalLotes from './modalLotes/ModalLotes';
import ModalNotas from './modalNotas/ModalNotas';
import { FaSpinner } from "react-icons/fa6";
import { SlNotebook } from "react-icons/sl";
import { MdMoreVert } from "react-icons/md";


export default function Modal({
  articuloCarrito,
  handleSubmit,
  closeModal,
  lotesEditados,
  alertaModal,
  lotesArticulos,
  setLotesArticulos,
  cantidad, setCantidad, notas, setNotas, total, descuento, setDescuento, precioArticulo, setPrecioArticulo
}) {

  const { apiURL } = useCarrito();
  const [lotes, setLotes] = useState([]);
  const [cantidadPorLote, setCantidadPorLote] = useState({});
  const [mostrarModalLotes, setMostrarModalLotes] = useState(false);
  const [showAgregarNotas, setShowAgregarNotas] = useState(false);
  const [ejemplo, setEjemplo] = useState({ ejemplo1: false, ejemplo2: true, ejemplo3: false });
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [lote, setLote] = useState("");
  const inputRefs = useRef({});
  const [loading, setLoading] = useState(true);
  const [showOpciones, setShowOpciones] = useState(false);


  useEffect(() => {
    fetch(`${apiURL}/get_lotes_json/${articuloCarrito.articuloid}`)
      .then(res => res.json())
      .then(data => {
        setLotes(data)
        setLoading(false)
      });
  }, [apiURL, articuloCarrito.articuloid]);

  const formatearFecha = (fecha) => {
    const fechaObj = new Date(fecha); // Convierte la fecha a un objeto Date
    return fechaObj.toLocaleDateString('es-ES'); // Devuelve la fecha en formato 'dd/mm/yyyy'
  };

  const changeLote = (lote) => {
    setLoteSeleccionado(lote);  // Cambia el lote seleccionado
    setLote(lote);              // Cambia el lote activo
  };


  const handleCantidadLoteChange = (nomalmacen, artdiscretoid, loteClave, value) => {
    const lote = lotes.find(l => l.clave === loteClave);

    if (lote && value <= lote.existencia) {
      setCantidadPorLote(prev => ({
        ...prev,
        [loteClave]: value
      }));

      setLotesArticulos(prev => {
        const index = prev.findIndex(item => item.artdiscretoid === artdiscretoid);

        if (index === -1) {
          return [
            ...prev,
            { nomalmacen, artdiscretoid, cantidadLote: value, "clave": loteClave }
          ];
        } else {
          const newLotesArticulos = [...prev];
          newLotesArticulos[index] = { ...newLotesArticulos[index], cantidadLote: value };
          return newLotesArticulos;
        }
      });
    } else {
      console.warn("Cantidad no valida para este lote");
    }
  };

  const calcularTotalCantidadSeleccionada = () => {
    return Object.values(cantidadPorLote).reduce((acc, curr) => acc + curr, 0);
  };


  const esCantidadValida = calcularTotalCantidadSeleccionada() === Number(cantidad);


  const formatearCantidad = (cantidad) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cantidad);
  };

  // Función para abrir el modal de lotes
  const abrirModalLotes = () => {
    setMostrarModalLotes(true);
  };

  // Función para cerrar el modal de lotes
  const cerrarModalLotes = () => {
    setMostrarModalLotes(false);
  };

  // Función para dar foco al input
  const handleDivClick = (lote) => {
    // Da foco al input del lote correspondiente
    if (inputRefs.current[lote.clave]) {
      inputRefs.current[lote.clave].focus();
    }
  };

  const handleDobleClick = (e, lote) => {
    e.stopPropagation();
    console.log("doble click");
    // Da foco al input del lote correspondiente
    if (inputRefs.current[lote.clave]) {
      // Valida si la existencia es menor o igual a la cantidad
      const cantidadAsignada = lote.existencia <= cantidad ? lote.existencia : cantidad;

      // Actualiza el estado cantidadPorLote para guardar la cantidad por clave de lote
      setCantidadPorLote((prevState) => ({
        ...prevState,
        [lote.clave]: Number(cantidadAsignada), // Usamos la clave del lote como llave y la cantidad como valor
      }));

      // Solo actualizar el valor si es necesario para evitar que el input se descontrole
      if (inputRefs.current[lote.clave].value !== cantidadAsignada) {
        inputRefs.current[lote.clave].value = cantidadAsignada;
      }
    }
  };

  const handleClick = (e, lote) => {
    e.stopPropagation();
    handleDivClick(lote);
    changeLote(lote);
  }

  const verificarCantidadRestante = () => {
    const valor = cantidad - calcularTotalCantidadSeleccionada();

    if (valor > 0) {
      return formatearCantidad(valor);
    }
    return "Cantidad exedida"
  }

  

  return (
    <>
      <div className="overlay" />
      <div className={styles.container}>
        <form className={styles.modal} onSubmit={handleSubmit}>

          <div className={styles.articulo_nombre}>
            <h5>{articuloCarrito.nombre}</h5>
            <p onClick={closeModal} className={styles.btn_cerrar}>
              <IoMdClose />
            </p>
          </div>
          {
            loading ? (
              <div className={styles.div_cargando}>
                <p className={styles.cargando}><FaSpinner /></p>
              </div>
            ) : (
              <div className={styles.div_modal}>
                <div className={styles.contenido}>

                  {/*Boton Agregar opciones*/}
                  <div div className={styles.div_agregar_opcion}>
                    <p className={styles.boton_opciones} onClick={()=>setShowOpciones(prev=>!prev)} title='Más opciones'><MdMoreVert /></p>
                    {
                      showOpciones && (
                        <div className={styles.div_opciones}>
                          <div>
                            <p onClick={()=>{
                              setShowAgregarNotas(true);
                              setShowOpciones(false);
                            }}>Agregar Nota</p>
                          </div>
                          <div>
                            <p>Otra opcion</p>
                          </div>
                        </div>
                      )
                    }
                  </div>

                  

                  <img className={styles.articulo_img} src={articuloCarrito.imagen} alt="" />
                  {/*
                    <p className={styles.articulo_descripcion}>
                      {articuloCarrito.descripcion}
                    </p>
                  */}


                  {/*TOTAL EN TIEMPO REAL DEL ARTICULO, DEPENDIENDO DE LA CANT, PRECIO Y DESCUENTO*/}
                  <div className={styles.total}>
                    <h3>Total: $<span>{formatearCantidad(total)}</span></h3>
                  </div>

                  {/*CAMPOS CANTIDAD, PRECIO, DESCUENTO*/}
                  <div className={styles.div_campos}>
                    <div>
                      <label htmlFor="cantidad">Cantidad:</label>
                      {/*<fieldset>
                        <p className={styles.sumar_button} onClick={()=> cantidad !== 1 && setCantidad(cantidad - 1)}>-</p>
                    */}<input
                        type="number"
                        step="0.01"
                        id="cantidad"
                        min={1}
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        autoComplete="off"
                      />
                      {/*<p className={styles.restar_button} onClick={()=>setCantidad(cantidad + 1)}>+</p>
                      </fieldset>
                      */}
                    </div>

                    <div className={styles.div_precio}>
                      <label htmlFor='precio'>Precio:</label>
                      <input
                        onChange={(e) => setPrecioArticulo(e.target.value)}
                        id='precio'
                        value={`${precioArticulo}`}
                        type="number"
                        step="0.01"
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label htmlFor='dcto'>Descuento:</label>
                      <input
                        id='dcto'
                        onChange={(e) => setDescuento(e.target.value)}
                        value={descuento}
                        type="number"
                        step="0.01"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  {/*MENSAJE DE AVISO SI YA HAS SELECCIONADO LOTES, EN CASO DE TENERLOS*/}
                  {
                    lotes.length !== 0 && (
                      <>
                        {
                          cantidad !== "" && (
                            lotes.length !== 0 && !esCantidadValida ? (
                              <p style={{ color: "red", border: "solid 1px red", padding: ".3rem", borderRadius: ".3rem", lineHeight: ".9", textAlign: "center", fontWeight: "bold", maxWidth: "350px", margin: "0 auto" }}>Selecciona de los lotes: {verificarCantidadRestante()}</p>
                            ) : (
                              <p style={{ color: "green", border: "solid 1px green", padding: ".3rem", borderRadius: ".3rem", textAlign: "center", fontWeight: "bold", maxWidth: "350px", margin: "0 auto" }}>Lotes seleccionados correctamente</p>
                            )
                          )
                        }
                        
                        {
                          alertaModal && (
                            <p className={styles.obligatorios}>{alertaModal}</p>
                          )
                        }
                      </>
                    )
                  }

                </div>


                {/*SECCION DE LOTES EN CUADRICULADO DE 3 COL*/}
                {
                  ejemplo.ejemplo2 && (
                    <div className={`${ejemplo.ejemplo3 ? styles.lotes_div_flex : styles.lotes_div}`}>
                      {lotes.map((lote, index) => (
                        <div
                          key={index}
                          onClick={(e) => handleClick(e, lote)}
                          onDoubleClick={(e) => handleDobleClick(e, lote)}
                          className={`${styles.lote} ${loteSeleccionado?.clave === lote.clave ? styles.selected : ''}`}
                        >
                          <div className={ejemplo.ejemplo3 && styles.card_lotes}>
                            <div>
                              <p><span style={{ fontWeight: "bold" }}>{formatearFecha(lote.fecha)}</span></p>
                            </div>
                            <div>
                              <p>Exist.: {lote.existencia}</p>
                            </div>
                            <div className={styles.lote_input}>
                              <label>C.:</label>
                              <input
                                ref={(el) => inputRefs.current[lote.clave] = el}
                                type="number"
                                step="0.01"
                                max={cantidad}
                                value={cantidadPorLote[lote.clave] ? (cantidadPorLote[lote.clave] > 0 ? cantidadPorLote[lote.clave].toString().replace(/^0+/, '') : '') : ''}
                                onChange={(e) => handleCantidadLoteChange(lote.nomalmacen, lote.artdiscretoid, lote.clave, Math.min(e.target.value, lote.existencia))}
                              />
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )
                }

                {/*MODAL DE LOTES*/}
                <div className={`${styles.div_lotes_notas} ${ejemplo.ejemplo1 && lotes.length > 0 ? styles.div_lotes_notas : styles.col}`}>
                  {
                    ejemplo.ejemplo1 && (
                      lotes.length > 0 && (
                        <div className={styles.div_lotesDisponibles}>
                          <p>Lotes Disponibles: {lotes.length}</p>
                          <p className={styles.boton_modal} onClick={abrirModalLotes}>{"Seleccionar Lotes"}</p>
                        </div>
                      )
                    )
                  }
                </div>

                <button type="submit" disabled={lotes.length !== 0 ? !esCantidadValida : false}>Agregar al Carrito <MdAddShoppingCart /></button>
              </div>
            )
          }

        </form >


        {/* Modal de lotes */}
        {mostrarModalLotes && (
          <>
            <ModalLotes
              cantidad={cantidad}
              lotes={lotes}
              cantidadPorLote={cantidadPorLote}
              handleCantidadLoteChange={handleCantidadLoteChange}
              cerrarModalLotes={cerrarModalLotes}
            />
          </>
        )}
        {/*MODAL AGREGAR NOTA*/}
        {
          showAgregarNotas && (
            <>
              <ModalNotas
                notas={notas}
                setNotas={setNotas}
                setShowAgregarNotas={setShowAgregarNotas}
              />
            </>
          )
        }


      </div >
    </>
  );
}
