import * as Utils from "./utils";
import React from "react";

export function useWindowSize() {
  const [windowSize, setWindowSize] = React.useState(Utils.getWindowSize());
  React.useEffect(() => {
    // TODO: Consider thottle
    const handleResize = () => {
      setWindowSize(Utils.getWindowSize());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
}
