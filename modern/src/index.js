import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import Debugger from "./debugger";

ReactDOM.render(
  window.location.pathname === "/debugger" ? <Debugger /> : <App />,
  document.getElementById("root")
);
