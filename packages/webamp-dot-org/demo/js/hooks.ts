import { useState, useEffect, useCallback } from "react";
import * as Utils from "./utils";

interface Size {
  width: number;
  height: number;
}

export function useWindowSize() {
  const [size, setSize] = useState<Size>(Utils.getWindowSize());
  const handler = useCallback(
    Utils.throttle(() => {
      setSize(Utils.getWindowSize());
    }, 100) as () => void,
    []
  );
  useEffect(() => {
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
    };
  }, [handler]);
  return size;
}
