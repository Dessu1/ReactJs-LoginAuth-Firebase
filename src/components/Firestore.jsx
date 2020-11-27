import React, { useEffect, useState } from "react";
import { db } from "../firebase";

import moment from "moment"; // Cambiar formato de hora
import "moment/locale/es"; // Pasarlo a español

const Firestore = (props) => {
  const [tareas, setTareas] = useState([]);
  const [tarea, setTarea] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [id, setId] = useState("");

  const [ultimo, setUltimo] = useState(null);
  const [desactivar, setDesactivar] = useState(false);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        setDesactivar(true);
        /**
         *  Llamamos a la base de datos para traer los docs
         */
        const data = await db
          .collection(props.user.uid)
          .limit(2) // limita la cantidad de objetos que retorna
          .orderBy("fecha", "desc") // ordena por fecha {"desc"} ->> forma descendente
          .get();

        const arrayData = data.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUltimo(data.docs[data.docs.length - 1]);

        setTareas(arrayData);

        /**
         *  Llamamos a la base de datos para saber si el docs esta vacio o no
         */
        const query = await db
          .collection(props.user.uid)
          .limit(2) // limita la cantidad de objetos que retorna
          .orderBy("fecha", "desc") // ordena por fecha {"desc"} ->> forma descendente
          .startAfter(data.docs[data.docs.length - 1]) // inicia despues del ultimo objeto que se le pasa por parametro
          .get();

        if (query.empty) {
          setDesactivar(true);
        } else setDesactivar(false);
      } catch (error) {
        console.log(error);
      }
    };

    obtenerDatos();
  }, [props.user.uid]);

  const tareasSiguientes = async () => {
    try {
      const data = await db
        .collection(props.user.uid)
        .limit(2) // limita la cantidad de objetos que retorna
        .orderBy("fecha", "desc") // ordena por fecha {"desc"} ->> forma descendente
        .startAfter(ultimo) // inicia despues del ultimo objeto que se le pasa por parametro
        .get();

      const arrayData = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTareas([...tareas, ...arrayData]);
      setUltimo(data.docs[data.docs.length - 1]);

      /**
       *  Llamamos a la base de datos para saber si el docs esta vacio o no
       */
      const query = await db
        .collection(props.user.uid)
        .limit(2) // limita la cantidad de objetos que retorna
        .orderBy("fecha", "desc") // ordena por fecha {"desc"} ->> forma descendente
        .startAfter(data.docs[data.docs.length - 1]) // inicia despues del ultimo objeto que se le pasa por parametro
        .get();

      if (query.empty) {
        setDesactivar(true);
      } else setDesactivar(false);
    } catch (error) {
      console.log(error);
    }
  };

  const agregar = async (e) => {
    e.preventDefault();

    if (!tarea.trim()) {
      console.log("Elemento Vacio");
      return;
    }

    try {
      const nuevaTarea = {
        name: tarea,
        fecha: Date.now(),
      };

      const data = await db.collection(props.user.uid).add(nuevaTarea);
      setTareas([...tareas, { ...nuevaTarea, id: data.id }]);
      setTarea("");
    } catch (error) {
      console.log(error);
    }
  };

  const eliminar = async (id) => {
    try {
      await db.collection(props.user.uid).doc(id).delete();

      const arrayFiltrado = tareas.filter((tarea) => tarea.id !== id); // Sacamos de las tareas el id eliminado
      setTareas(arrayFiltrado);
    } catch (error) {
      console.log(error);
    }
  };

  const activarEdicion = (tarea) => {
    setModoEdicion(true);
    setTarea(tarea.name);
    setId(tarea.id);
  };

  const editar = async (e) => {
    e.preventDefault();

    if (!tarea.trim()) {
      console.log("Elemento Vacio");
      return;
    }

    try {
      await db.collection(props.user.uid).doc(id).update({
        name: tarea,
      });

      const arrayEditado = tareas.map((item) =>
        item.id === id ? { id: item.id, fecha: item.fecha, name: tarea } : tarea
      );

      setTareas(arrayEditado);
      setModoEdicion(false);
      setTarea("");
      setId("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='container mt-3'>
      <div className='row'>
        <div className='col-md-6'>
          <h2>Lista de Tareas</h2>
          <ul className='list-group mt-5'>
            {tareas.map((tarea) => {
              return (
                <li className='list-group-item ' key={tarea.id}>
                  {tarea.name} - {moment(tarea.fecha).format("LLL")}
                  <button
                    className='btn btn-danger btn-sm - float-right'
                    onClick={() => eliminar(tarea.id)}
                  >
                    Eliminar
                  </button>
                  <button
                    className='btn btn-warning btn-sm - float-right mr-2'
                    onClick={() => activarEdicion(tarea)}
                  >
                    Editar
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            className='btn btn-info btn-block btn-sm mt-2'
            onClick={() => tareasSiguientes()}
            disabled={desactivar}
          >
            Siguiente
          </button>
        </div>
        <div className='col-md-6'>
          <h2>{modoEdicion ? "Editar Tarea" : "Agregar Tarea"}</h2>
          <form
            className='form-group mt-5'
            onSubmit={modoEdicion ? editar : agregar}
          >
            <input
              type='text'
              placeholder='ingrese tarea'
              className='form-control mb-2'
              onChange={(e) => setTarea(e.target.value)}
              value={tarea}
            />

            <button
              className={
                modoEdicion
                  ? "btn btn-warning btn-block"
                  : "btn btn-dark btn-block"
              }
              type='submit'
            >
              {modoEdicion ? "Editar" : "Agregar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Firestore;
