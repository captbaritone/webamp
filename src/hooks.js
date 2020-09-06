import * as Utils from "./utils";
import { useMemo, useState, useEffect } from "react";

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState(Utils.getWindowSize());
  useEffect(() => {
    // TODO: Consider thottle
    const handleResize = () => {
      setWindowSize(Utils.getWindowSize());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
}

// https://stackoverflow.com/a/13382873/1263117
export function useScrollbarWidth() {
  // TODO: Can this change over the lifetime of the window?
  return useMemo(() => {
    // Creating invisible container
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.overflow = "scroll"; // forcing scrollbar to appear
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
    document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = document.createElement("div");
    outer.appendChild(inner);

    // Calculating difference between container's full width and the child width
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

    // Removing temporary elements from the DOM
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
  }, []);
}
