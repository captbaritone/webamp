import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "./redux/store";
import App from "./App";
// import registerServiceWorker from "./registerServiceWorker";
import { unregister } from "./registerServiceWorker";

ReactDOM.render(
  <Provider store={createStore()}>
    <App />
  </Provider>,
  document.getElementById("root")
);
// registerServiceWorker();

// At one point I had serivce workers installed. Then I removed it.
// It seems to have lead to apps never getting updated.
unregister();
