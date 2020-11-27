import React, { useCallback, useState } from "react";
import { withRouter } from "react-router-dom";
import { auth, db } from "../firebase";

const Login = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [esRegistro, setEsRegistro] = useState(true);

  const procesarDatos = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Ingrese un Email valido!");

      return;
    }

    if (!password.trim()) {
      setError("Ingrese una Password!");
      return;
    }

    if (password.length < 6) {
      setError("Ingrese una Password con más de 6 caracteres");
      return;
    }

    if (esRegistro) {
      registrar();
    } else {
      ingresar();
    }
  };

  const registrar = useCallback(async () => {
    try {
      const res = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection("usuarios").doc(res.user.email).set({
        email: res.user.email,
        uid: res.user.uid,
      });
      /*
      await db.collection(res.user.uid).add({
        name: "tarea ejemplo",
        fecha: Date.now(),
      });
      */
      setError(null);
      setEmail("");
      setPassword("");

      props.history.push("/admin");
    } catch (error) {
      console.log(error);
      if (error.code === "auth/invalid-email") setError("Email no valido!!");
      if (error.code === "auth/email-already-in-use")
        setError("Email ya registrado!!");
    }
  }, [email, password, props.history]); // [] -> State que estamos usando

  const ingresar = useCallback(async () => {
    try {
      const res = await auth.signInWithEmailAndPassword(email, password);
      setError(null);
      setEmail("");
      setPassword("");

      props.history.push("/admin");
    } catch (error) {
      console.log(error);
      if (error.code === "auth/user-not-found") setError("Email no registrado");
      if (error.code === "auth/invalid-email")
        setError("El email ingresado no es valido");
      if (error.code === "auth/wrong-password")
        setError("Password incorrecta!");
    }
  }, [email, password, props.history]); // [] -> State que estamos usando

  return (
    <div className='container mt-5'>
      <h3 className='text-center'>
        {esRegistro ? "Registro de Usuario" : "Login de Acceso"}
      </h3>
      <hr />

      <div className='row justify-content-center'>
        <div className='col-12 col-sm-8 col-md-6 col-xl-4'>
          <form className='form-group' onSubmit={procesarDatos}>
            {error && <div className='alert alert-danger'>{error}</div>}
            <input
              type='email'
              className='form-control mb-2'
              placeholder='Ingrese un email'
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <input
              type='password'
              className='form-control mb-2'
              placeholder='Ingrese un password'
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />

            <button className='btn btn-dark btn-lg btn-block' type='submit'>
              {esRegistro ? "Registrarse" : "Acceder"}
            </button>

            <button
              className='btn btn-info btn-block btn-sm'
              onClick={() => setEsRegistro(!esRegistro)}
              type='button'
            >
              {esRegistro ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
            </button>
            {!esRegistro ? (
              <button
                className='btn btn-danger btn-lg btn-sm mt-2 '
                onClick={() => setEsRegistro(!esRegistro)}
                type='button'
                onClick={() => props.history.push("/reset")}
              >
                Recuperar Contraseña
              </button>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
};

export default withRouter(Login);
