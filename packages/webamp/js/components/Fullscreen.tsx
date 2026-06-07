// Adapted from https://github.com/snakesilk/react-fullscreen
import { ReactNode, useRef, useLayoutEffect, useEffect } from "react";

interface Props {
  enabled: boolean;
  children: ReactNode;
  onChange(fullscreen: boolean): void;
}

function leaveFullScreen() {
  if (document.fullscreenEnabled) {
    document.exitFullscreen();
  }
}

function enterFullScreen(node: HTMLDivElement) {
  if (document.fullscreenEnabled) {
    node.requestFullscreen();
  }
}

function FullScreen(props: Props) {
  const { onChange, enabled } = props;
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function detectFullScreen() {
      if (onChange) {
        onChange(document.fullscreenElement === ref.current);
      }
    }
    document.addEventListener("fullscreenchange", detectFullScreen);
    return () => {
      document.removeEventListener("fullscreenchange", detectFullScreen);
    };
  }, [onChange]);

  // This must run in response to a click event, so we'll use useLayoutEffect just in case.
  useLayoutEffect(() => {
    const isEnabled = document.fullscreenElement === ref.current;
    if (isEnabled && !enabled) {
      leaveFullScreen();
    } else if (!isEnabled && enabled && ref.current != null) {
      enterFullScreen(ref.current);
    }
  }, [enabled]);

  return (
    <div
      ref={ref}
      style={props.enabled ? { height: "100%", width: "100%" } : undefined}
    >
      {props.children}
    </div>
  );
}

export default FullScreen;
