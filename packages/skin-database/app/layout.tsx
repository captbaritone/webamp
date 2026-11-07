import { SearchDebounceConfig } from "./redux";
import { parseSearchDebounceMs } from "../legacy-client/src/searchConfig";
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

// An experiment, not linked anywhere yet: ?integer-scale shows the feed's
// skins at a whole number of screen pixels per pixel (see .integer-scale in
// scroll.css), for the rest of the visit (this tab), and ?integer-scale=0
// stops. Set before the page is drawn, so it doesn't jump: the class on
// <html>, and --device-pixel, a screen pixel in CSS pixels, again whenever
// that changes (zooming, or moving the window to another screen).
const INTEGER_SCALE_SCRIPT = `(function () {
  var root = document.documentElement;
  try {
    var param = new URLSearchParams(location.search).get("integer-scale");
    if (param != null) {
      if (param === "0") sessionStorage.removeItem("integer-scale");
      else sessionStorage.setItem("integer-scale", "1");
    }
    if (sessionStorage.getItem("integer-scale") === "1") {
      root.classList.add("integer-scale");
    }
  } catch (e) {}
  (function update() {
    var ratio = window.devicePixelRatio || 1;
    root.style.setProperty("--device-pixel", 1 / ratio + "px");
    matchMedia("(resolution: " + ratio + "dppx)").addEventListener("change", update, { once: true });
  })();
})();`;

export default function RootLayout({ children }: Props) {
  // Read per request rather than at build time, so SEARCH_DEBOUNCE_MS can be
  // changed with a service restart instead of a rebuild.
  const searchDebounceMs = parseSearchDebounceMs(
    process.env.SEARCH_DEBOUNCE_MS
  );
  return (
    // The script sets a class and style on <html> before React hydrates it.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTEGER_SCALE_SCRIPT }} />
      </head>
      <body>
        <SearchDebounceConfig searchDebounceMs={searchDebounceMs} />
        {children}
        <GoogleAnalytics gaId="UA-96948-20" />
      </body>
    </html>
  );
}
