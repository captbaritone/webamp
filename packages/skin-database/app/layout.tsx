import ReduxContextProvider from "./redux";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReduxContextProvider>{children}</ReduxContextProvider>
        <GoogleAnalytics gaId="UA-96948-20" />
      </body>
    </html>
  );
}
