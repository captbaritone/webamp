import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "./redux/store";
import App from "./App";
import * as Sentry from "@sentry/react";
// import registerServiceWorker from "./registerServiceWorker";
import { unregister } from "./registerServiceWorker";
import { SENTRY_DSN } from "./constants";

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [Sentry.replayIntegration()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  tracesSampleRate: 1.0,

  // // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
  // tracePropagationTargets: [/^\//, /^https:\/\/yourserver\.io\/api/],

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
  // replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

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
