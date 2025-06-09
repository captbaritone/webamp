"use client";
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

import LegacyApp from "../legacy-client/src/App";
import SearchLogo from "./SearchLogo";

export default function App() {
  return <LegacyApp searchLogo={<SearchLogo />} />;
}
