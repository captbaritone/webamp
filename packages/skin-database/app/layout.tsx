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

export default function RootLayout({ children }: Props) {
  // Read per request rather than at build time, so SEARCH_DEBOUNCE_MS can be
  // changed with a service restart instead of a rebuild.
  const searchDebounceMs = parseSearchDebounceMs(
    process.env.SEARCH_DEBOUNCE_MS
  );
  return (
    <html lang="en">
      <body>
        <SearchDebounceConfig searchDebounceMs={searchDebounceMs} />
        {children}
        <GoogleAnalytics gaId="UA-96948-20" />
      </body>
    </html>
  );
}
