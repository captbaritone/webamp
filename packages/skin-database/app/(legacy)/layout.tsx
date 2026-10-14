import App from "../App";
import LegacyUrlSync from "./LegacyUrlSync";

export default function Layout() {
  return (
    <>
      <LegacyUrlSync />
      <App />
    </>
  );
}
