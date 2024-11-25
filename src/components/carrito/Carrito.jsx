import React, { useState, useEffect, useContext } from 'react';
import styles from "../carrito/carrito.module.css";
import { FaRegTrashAlt, FaEdit, FaCheck } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { BiLike } from "react-icons/bi";
import { jsPDF } from "jspdf";
import img from "../../../public/tv.jpg";
import { useCarrito } from "../../context/CarritoContext"
import { useNavigate } from 'react-router-dom';
import Modal from '../modal/Modal';

export default function Carrito() {
  const [alerta, setAlerta] = useState(false);
  const [nota, setNota] = useState("");
  const [precio, setPrecio] = useState("");
  const [descuento, setDescuento] = useState("");
  const [cantidad, setCantidad] = useState(0);
  const [editarArticulo, setEditarArticulo] = useState(false);
  const [articuloEditando, setArticuloEditando] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [total, setTotal] = useState();
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const navigate = useNavigate();
  const [lotes, setLotes] = useState([]);
  const [cantidadPorLote, setCantidadPorLote] = useState({});  // Estado para la cantidad seleccionada por lote
  const [lotesArticulosEditados, setLotesArticulosEditados] = useState([]);
  const [lotesDisp, setLotesDisp] = useState([]);
  const [indexEditado, setIndexEditado] = useState("");
  const [mensaje, setMensaje] = useState(false);
  const [clienteOBJ, setClienteOBJ] = useState({})


  const extraerCliente = () => {
    const getCliente = async () => {
      try {
        const res = await fetch(`${apiURL}/get_catalogos_json/clientes`);
        const data = await res.json();
        if (res.ok) {
          const clienteStorage = localStorage.getItem("cliente");
          const clienteDecodificado = atob(clienteStorage);
          const clienteEncontrado = data.find(cliente => cliente.clienteid === clienteDecodificado.cliente_id);
          setClienteOBJ(clienteEncontrado);
        } else {
          console.log("Hubo un error al obtener cliente");
        }
      } catch (error) {
        console.log("Hubo un problema con la solicitud de cliente");
      }
    }
    getCliente();
  }
  useEffect(() => {
    extraerCliente();
  }, []);

  // Función que calcula el total con descuento
  const calcularTotalModal = (precioArticulo, cantidad, descuento, preciolista) => {
    if (precioArticulo && cantidad && descuento !== undefined) {
      const precioConDescuento = precioArticulo - (preciolista ? preciolista : precioArticulo * (descuento / 100));
      return precioConDescuento * cantidad;
    }
    return 0; // Retorna 0 si los valores no son válidos
  };

  // Usamos useEffect para recalcular el total cada vez que cambien los valores dentro del modal
  useEffect(() => {
    if (editarArticulo && articuloEditando) {
      // Recalcular el total con los valores actuales del artículo
      const nuevoTotal = calcularTotalModal(precio, cantidad, descuento, articuloEditando.preciolista);
      setTotal(nuevoTotal); // Actualizar el estado total con el valor calculado
    }
  }, [articuloEditando, editarArticulo, cantidad, precio, descuento]);  // Recalcular cuando articuloEditando o editarArticulo cambien


  const { carrito, setCarrito, cantidadCarrito, cliente, apiURL } = useCarrito();


  const fetchLotes = async () => {
    // Asegúrate de que 'articuloEditando' y 'Articulo_id' están definidos
    if (articuloEditando && articuloEditando.articuloid) {

      try {
        // Hacemos la petición y esperamos la respuesta
        const response = await fetch(`${apiURL}/get_lotes_json/${articuloEditando.articuloid}`);

        // Verificamos si la respuesta es válida
        if (!response.ok) {
          throw new Error(`Error en la respuesta de la API: ${response.statusText}`);
        }

        // Parseamos el cuerpo de la respuesta a JSON
        const data = await response.json();

        // Verifica si 'data' es un array antes de continuar

        if (Array.isArray(data)) {
          // Mapeamos los lotes de la API, agregando el campo 'cantidadLote' de 'articuloEditando.lotesArticulos'
          const lotesFiltrados = data.map(lote => {
            // Busca el lote correspondiente en articuloEditando.lotesArticulos
            const loteEdit = articuloEditando.lotesArticulos.find(l => l.artdiscretoid === lote.artdiscretoid);


            if (loteEdit) {
              // Si encontramos el lote correspondiente, le agregamos el campo cantidadLote
              return {
                ...lote,  // Mantén todas las propiedades del lote
                cantidadLote: loteEdit.cantidadLote  // Si no existe, por defecto será 0
              };
            }

            // Si no se encuentra el lote en articuloEditando.lotesArticulos, devolvemos el lote original
            return lote;
          });

          // Actualiza el estado con los lotes filtrados y con el campo cantidadLote añadido
          setLotes(lotesFiltrados);
        } else {
          console.error("La respuesta no es un array de lotes");
        }
      } catch (error) {
        console.error('Error al obtener los lotes:', error);
      }
    } else {
      console.error('No se ha definido articuloEditando o Articulo_id');
    }
  };

  useEffect(() => {
    // Verifica que articuloEditando y Articulo_id están definidos
    if (articuloEditando && articuloEditando.articuloid) {
      fetchLotes();
    }
  }, [articuloEditando]);


  const restarCantidad = (index) => {
    if (index >= 0 && index < carrito.length && carrito[index].cantGlobal >= 2) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[index].cantGlobal -= 1;

      // Convertir el carrito a JSON y luego codificarlo en Base64
      const carritoBase64 = btoa(JSON.stringify(nuevoCarrito)); // btoa() codifica a Base64

      // Guardar el carrito codificado en Base64 en localStorage
      localStorage.setItem("carrito", carritoBase64);

      // Actualizar el estado con el nuevo carrito
      setCarrito(nuevoCarrito);
    }
  };

  const sumarCantidad = (index) => {
    if (index >= 0 && index < carrito.length) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[index].cantGlobal += 1;

      // Convertir el carrito a JSON y luego codificarlo en Base64
      const carritoBase64 = btoa(JSON.stringify(nuevoCarrito)); // btoa() codifica a Base64

      // Guardar el carrito codificado en Base64 en localStorage
      localStorage.setItem("carrito", carritoBase64);

      // Actualizar el estado con el nuevo carrito
      setCarrito(nuevoCarrito);
    }
  };



  const eliminarArticulo = (index) => {
    // Filtra los artículos que no coincidan con el id que deseas eliminar
    const nuevoCarrito = carrito.filter((item, idx) => idx !== index);

    // Actualiza el estado del carrito
    setCarrito(nuevoCarrito);

    // Codifica el carrito en base64 antes de almacenarlo
    const carritoBase64 = btoa(JSON.stringify(nuevoCarrito));

    // Almacena el carrito codificado en base64 en localStorage
    localStorage.setItem("carrito", carritoBase64);
  };

  const confirmarEliminar = () => {
    localStorage.removeItem("carrito");
    setCarrito([]);
    setAlerta(false);
    document.body.style.overflow = "";
  };

  const cancelarEliminar = () => {
    setAlerta(false);
    document.body.style.overflow = "";
  };

  const eliminarTodo = () => {
    setAlerta(true);
    document.body.style.overflow = "hidden";
  };

  // Definir la función calcularTotal que actualiza el estado total
  const calcularTotal = () => {
    let total = 0;

    carrito.forEach(item => {
      const cantidadArticulo = item.cantGlobal;
      const precioConDescuento = item.precioArticulo - (item.precioArticulo * item.descuento / 100);
      const totalArticulo = precioConDescuento * cantidadArticulo;
      total += totalArticulo;
    });

    return total.toFixed(2);  // Devolver el total calculado con dos decimales
  };


  // Usar useEffect para ejecutar el cálculo solo cuando el carrito cambia
  useEffect(() => {
    calcularTotal(); // Calcular el total solo cuando el carrito cambie
  }, [carrito]);  // Dependencia de carrito, así que solo se recalcula cuando el carrito cambia




  const handleComprar = () => {

    const detalles = carrito.map(item => ({
      'articuloId': item.articuloid,
      'claveArticulo': item.Clave_articulo,
      'unidades': item.cantGlobal,
      'precioUnitario': item.precioArticulo,
      'dscto': item.descuento,
      'total': (item.precioArticulo * item.cantidad) - (item.precioArticulo * item.descuento / 100 * item.cantidad),
      'descripcion': item.Nombre,
      'notas': item.notas,
      "lotes": item.lotesArticulos.map(lote => ({
        "artdiscretoid": lote.artdiscretoid,
        "cantidad": lote.cantidadLote,
      }))
    }));
    const body = {
      'versionEsquema': 'N/D',
      'tipoComando': 'insac.doctos',
      'encabezado': {
        'clienteId': cliente.cliente_id,
        'claveCliente': cliente.claveCliente,
        'fecha': new Date().toISOString(),
        'observaciones': cliente.obs || '',
        'subtotal': calcularTotal(),
        'impuesto': '0',
        'total': calcularTotal(),
      },
      'detalles': detalles,
    }
    console.log(JSON.stringify(body, null, 2));
    console.log(body);
    setCarrito([]);
    localStorage.removeItem("carrito");
    navigate("/");
  }


  const recuperarCarrito = () => {
    const carritoBase64 = localStorage.getItem('carrito');

    if (carritoBase64) {
      try {
        // Decodificamos el carrito de Base64 a JSON
        const carritoDecoded = JSON.parse(atob(carritoBase64));
        setCarrito(carritoDecoded);
      } catch (error) {
        console.error("Error al decodificar carrito desde Base64", error);
      }
    }
  };

  // Recuperar el carrito al montar el componente
  useEffect(() => {
    recuperarCarrito();
  }, []);

  const handleEditarArticulo = (item) => {
    setArticuloEditando(item);
    setNota(item.notas);
    setPrecio(item.precioArticulo);
    setDescuento(item.descuento);
    setCantidad(item.cantGlobal);
    setEditarArticulo(true);
    setLotesDisp(item.lotesArticulos);
  };



  const handleGuardarArticulo = (e, item) => {
    e.preventDefault();
    // Calcular la suma de las cantidades de los lotes editados
    const sumaLotes = lotesArticulosEditados.reduce((total, lote) => total + lote.cantidadLote, 0);

    // Verificar si la suma de las cantidades de los lotes no sobrepasa la cantidad total
    if(articuloEditando.lotesArticulos.length !== 0 && sumaLotes !== Number(cantidad)) {
      // Si la suma es mayor a la cantidad total, mostrar un mensaje de error
      alert('La suma de las cantidades de los lotes no puede ser diferente a la cantidad total del artículo.');
      setLotesArticulosEditados([]);
      return;
    }

    const lotesfiltrados = lotesArticulosEditados.filter(lote => lote.cantidadLote > 0);

    // Si la validación pasa, procedemos a editar el artículo en el carrito
    const editado = carrito.map((articulo, index) =>
      index === indexEditado
        ? {
          ...articulo,
          notas: nota.trim(),
          precioArticulo: precio,
          descuento: descuento,
          cantGlobal: cantidad,
          lotesArticulos: lotesfiltrados,
        }
        : articulo
    );

    // Codificamos el carrito a Base64 antes de almacenarlo
    const carritoBase64 = btoa(JSON.stringify(editado));

    // Guardamos el carrito codificado en Base64 en localStorage
    localStorage.setItem("carrito", carritoBase64);

    // Establecer el carrito actualizado en el estado
    setCarrito(editado);

    // Limpiar los campos y cerrar la ventana de edición
    setNota("");
    setEditarArticulo(false);
    setArticuloEditando(null);
    setLotesArticulosEditados([]);
    setCantidadPorLote({});
  };



  // Manejador para cambiar la cantidad en un lote específico
  const handleCantidadLoteChange = (nomalmacen, artdiscretoid, loteClave, value) => {
    // Encuentra el lote correspondiente con la clave
    const lote = lotes.find(l => l.clave === loteClave);

    // Verifica que el lote exista y que la cantidad no exceda la existencia disponible
    if (lote && value <= lote.existencia) {
      // Actualiza la cantidad por lote
      setCantidadPorLote(prev => ({
        ...prev,
        [loteClave]: value,
      }));

      // Actualiza o agrega el artículo en los lotesArticulosEditados
      setLotesArticulosEditados(prev => {
        // Busca el índice del artículo en el array de lotesArticulosEditados
        const index = prev.findIndex(item => item.artdiscretoid === artdiscretoid);

        if (index === -1) {
          // Si el artículo no existe, agrega un nuevo objeto con la cantidadLote
          return [
            ...prev,
            { nomalmacen, artdiscretoid, cantidadLote: value },
          ];
        } else {
          // Si el artículo ya existe, actualiza la cantidadLote
          const newLotesArticulos = [...prev];
          newLotesArticulos[index] = { ...newLotesArticulos[index], cantidadLote: value };
          return newLotesArticulos;
        }
      });
    }
  };


  // formatear la fecha que trae el lote
  const formatearFecha = (fecha) => {
    const fechaObj = new Date(fecha); // Convierte la fecha a un objeto Date
    return fechaObj.toLocaleDateString('es-ES'); // Devuelve la fecha en formato 'dd/mm/yyyy'
  };

  
  const formatearCantidad = (cantidad) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cantidad);
  };

  return (
    <>
      {!previewUrl ? (
        <div className={styles.carrito_contenedor}>
          <h3>Carrito</h3>
          {carrito.length > 0 && (
            <div className={styles.div_eliminarTodo}>
              <p onClick={eliminarTodo} className={styles.eliminarTodo}><FaRegTrashAlt />Eliminar todo</p>
            </div>
          )}
          <div className={styles.div_articulos}>
            {carrito.length > 0 && (
              <div className={styles.resumen_contenedor}>
                <div>
                  <p>Articulos: ({cantidadCarrito})</p>
                  <p>Total del Carrito: ${calcularTotal()}</p>
                </div>
                <button onClick={handleComprar}>Comprar</button>
              </div>
            )}
            {carrito.length > 0 ? carrito.map((item, index) => (
              <div
                key={index}
                className={styles.articulos_contenedor}
              >
                <p className={styles.articulo_nombre}>{item.nombre}</p>
                <div className={styles.articulo_contenedor}>
                  <div className={styles.div_articulo}>
                    <div className={styles.nameImg_container}>
                      <img src={item.imagen} className={styles.articulo_imagen} alt={item.Nombre}></img>
                    </div>
                    <div className={styles.div_cantidad}>
                      <p>Cant. total: <span>{item.cantGlobal}</span></p>

                      {
                        item.lotesArticulos.length > 0 && (
                          <div className={styles.lotes_div_carrito}>
                            <p className={styles.cantidad_lotes}>Cant. por lotes: </p>

                            <div className={styles.container_lotes_carrito}>
                              {item.lotesArticulos.map((lote, index) => (
                                <p className={styles.lotes_carrito} key={index}>
                                  {lote.nomalmacen}: <span>{lote.cantidadLote}</span>
                                </p>
                              ))}
                            </div>

                          </div>
                        )
                      }



                      {
                        item.lotesArticulos.length === 0 && (
                          <div className={styles.div_agregar}>
                            <p onClick={() => restarCantidad(index)}>-</p>
                            <p onClick={() => sumarCantidad(index)}>+</p>
                          </div>
                        )
                      }




                    </div>
                    <div className={styles.div_precio}>
                      <p>Precio: ${item.preciolista || item.precioArticulo}</p>
                      <p>Subtotal: ${formatearCantidad(item.precioArticulo * item.cantGlobal)}</p>
                      <p>Descuento: {item.descuento}%</p>
                      <p>
                        Total: $
                        {formatearCantidad(((item.precioArticulo - (item.precioArticulo * item.descuento / 100)) * item.cantGlobal).toFixed(2))}
                      </p>


                    </div>
                    <div className={styles.div_editar}>
                      <p onClick={() => eliminarArticulo(index)} className={styles.articulo_eliminar}><FaRegTrashAlt /></p>
                      <p className={styles.editar}
                        onClick={() => {
                          handleEditarArticulo(item);
                          setIndexEditado(index);
                        }}><FaEdit /></p>
                    </div>
                  </div>
                  <div className={styles.notas}>
                    <p><span>Notas:</span> {item.notas}</p>
                  </div>


                  {/* MODAL EDITAR ARTICULO */}
                  {editarArticulo && articuloEditando.articuloid === item.articuloid && (
                    <>
                      <Modal
                        articuloCarrito={articuloEditando}
                        handleSubmit={handleGuardarArticulo}
                        closeModal={()=>setEditarArticulo(false)}
                        cantidad={cantidad}
                        setCantidad={setCantidad}
                        precioArticulo={precio}
                        setPrecioArticulo={setPrecio}
                        descuento={descuento}
                        setDescuento={setDescuento}
                        notas={nota}
                        setNotas={setNota}
                        setLotesArticulos={setLotesArticulosEditados}
                        total={total}
                      />
                    </>
                  )}
                </div>
                {alerta && <div className={styles.overlay} onClick={cancelarEliminar} />}
                <div className={`alertaEliminar ${alerta && "mostrar"}`}>
                  <p>Deseas eliminar todo?</p>
                  <div className={styles.div_confirmacion}>
                    <button onClick={confirmarEliminar}><BiLike /></button>
                    <button onClick={cancelarEliminar}><IoMdClose /></button>
                  </div>
                </div>
              </div>
            )) : (
              <div className={styles.div_carritoVacio}>
                <h4>Agrega articulos al carrito, y los veras aqui.</h4>
                <p><IoCartOutline /></p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.pdf_container}>
          <h3>Previsualización del Ticket</h3>
          <div>
            <button onClick={descargarPDF}>Descargar PDF</button>
            <button onClick={() => setPreviewUrl("")}><IoMdClose /></button>
          </div>
          <iframe src={previewUrl} width="100%" height="500px" title="Previsualización PDF"></iframe>
        </div>
      )}
    </>
  );
}

