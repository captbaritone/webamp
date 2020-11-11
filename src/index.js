import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "./redux/store";
import App from "./App";
// import * as Sentry from "@sentry/react";
// import { Integrations } from "@sentry/tracing";
// import registerServiceWorker from "./registerServiceWorker";
import { unregister } from "./registerServiceWorker";
// import { SENTRY_DSN } from "./constants";

/*
Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});
*/

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
