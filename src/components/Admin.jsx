import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { withRouter } from "react-router-dom";
import Firestore from "./Firestore";

const Admin = (props) => {
  const [user, setUser] = useState("");

  useEffect(() => {
    if (auth.currentUser) {
      setUser(auth.currentUser);
    } else {
      props.history.push("/login");
    }
  }, [props.history]);

  return (
    <div>
      <h2>Zona Protegida</h2>
      <hr />
      {user && <Firestore user={user} />}
    </div>
  );
};

export default withRouter(Admin);
