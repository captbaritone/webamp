import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "./redux/store";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";

ReactDOM.render(
  <Provider store={createStore()}>
    <App />
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
