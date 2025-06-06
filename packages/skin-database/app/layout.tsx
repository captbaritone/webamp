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
import ReduxContextProvider from "./redux";
import { GoogleAnalytics } from "@next/third-parties/google";

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>
        <ReduxContextProvider>{children}</ReduxContextProvider>
        <GoogleAnalytics gaId="UA-96948-20" />
      </body>
    </html>
  );
}
