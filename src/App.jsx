import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Admin from "./components/Admin";
import Login from "./components/Login";
import NavBar from "./components/NavBar";
import Reset from "./components/Reset";

import { auth } from "./firebase";

function App() {
  const [firebaseUser, setFirebaseUser] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setFirebaseUser(user);
      } else setFirebaseUser(null);
    });
  }, []);

  return firebaseUser !== false ? (
    <Router>
      <div>
        <NavBar firebaseUser={firebaseUser} />
        <Switch>
          <Route exact path='/'>
            Inicio
          </Route>
          <Route exact path='/login'>
            <Login />
          </Route>
          <Route exact path='/admin'>
            <Admin />
          </Route>
          <Route exact path='/reset'>
            <Reset />
          </Route>
        </Switch>
      </div>
    </Router>
  ) : (
    <p>Cargando .....</p>
  );
}

export default App;
