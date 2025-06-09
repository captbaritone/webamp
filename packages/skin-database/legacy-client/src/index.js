// There is some bug between how JSZip pulls in setimmediate (which it expects
// to polyfill `window.setimmediate` and our Webpack setup. The result is that
// one of our bundles is missing the polyfill. If we call JSZip code from within
// that bundle the polyfill is not present and we get an error.
//
// This explicit import should ensure that the polyfill is present in the
// entrypoint bundle and thus always set on `window`.
//
// We should be able to remove this once we root cause the bundling issue.
import "setimmediate";

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
  integrations: [Sentry.replayIntegration(), Sentry.httpClientIntegration()],

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
