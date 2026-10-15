import App from "../App";
import ReduxContextProvider from "../redux";
import LegacyUrlSync from "./LegacyUrlSync";

// The classic museum. Its pages render nothing themselves: the app reads the
// URL and renders the right view.
export default function Layout() {
  return (
    <ReduxContextProvider>
      <LegacyUrlSync />
      <App />
    </ReduxContextProvider>
  );
}
