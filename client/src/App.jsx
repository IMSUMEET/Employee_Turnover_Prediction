import React, { useState } from "react";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import PredictionApp from "./PredictionApp";

function App() {
  const [auth, setAuth] = useState({ is: false, token: null });
  const [register, setRegister] = useState(false);
  if (auth.is) {
    return (
      <PredictionApp
        onAuthFail={() => {
          setAuth({ is: false, token: null });
        }}
        token={auth.token}
      />
    );
  }
  if (register) {
    return (
      <Registration
        onEnd={() => {
          setRegister(false);
        }}
      />
    );
  }
  return (
    <Login
      onAuth={(token) => {
        setAuth({ is: true, token });
      }}
      onBack={() => {
        setRegister(true);
      }}
    />
  );
}

export default App;
