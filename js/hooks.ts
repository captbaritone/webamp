import React, { useState, useEffect } from "react";
import * as Utils from "./utils";

interface Size {
  width: number;
  height: number;
}

export function useScreenSize() {
  const [size] = useState<Size>(Utils.getScreenSize());
  // TODO: We could subscribe to screen size changes.
  return size;
}

export function useWindowSize() {
  const [size, setSize] = useState<Size>(Utils.getWindowSize());
  const handler = Utils.throttle(() => {
    setSize(Utils.getWindowSize());
  }, 100) as () => void;
  useEffect(() => {
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
    };
  }, [setSize, handler]);
  return size;
}

// Call a callback when the component unmounts.
export function useOnUnmount(unmountCallback: () => void) {
  const onUnmountRef = React.useRef(unmountCallback);
  // Could/should I just assing this during render rather than scheduling for after the render?
  React.useEffect(() => {
    onUnmountRef.current = unmountCallback;
  }, [unmountCallback]);
  React.useEffect(() => {
    return () => onUnmountRef.current();
  }, []);
}
