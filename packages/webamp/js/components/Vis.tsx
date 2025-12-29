import React, { useMemo, useState, useLayoutEffect, useEffect } from "react";

import * as Actions from "../actionCreators";
import * as Selectors from "../selectors";
import { useTypedSelector, useActionCreator } from "../hooks";
import { VISUALIZERS, MEDIA_STATUS } from "../constants";
import { createVisualizerEngine } from "./VisualizerEngine";

type Props = {
  analyser: AnalyserNode;
};

// Pre-render the background grid
function preRenderBg(options: {
  width: number;
  height: number;
  bgColor: string;
  fgColor: string;
  windowShade: boolean;
  pixelDensity: number;
}): HTMLCanvasElement {
  const { width, height, bgColor, fgColor, windowShade, pixelDensity } =
    options;
  // Off-screen canvas for pre-rendering the background
  const bgCanvas = document.createElement("canvas");
  bgCanvas.width = width;
  bgCanvas.height = height;
  const distance = 2 * pixelDensity;

  const bgCanvasCtx = bgCanvas.getContext("2d");
  if (bgCanvasCtx == null) {
    throw new Error("Could not construct canvas context");
  }
  bgCanvasCtx.fillStyle = bgColor;
  bgCanvasCtx.fillRect(0, 0, width, height);
  if (!windowShade) {
    bgCanvasCtx.fillStyle = fgColor;
    for (let x = 0; x < width; x += distance) {
      for (let y = pixelDensity; y < height; y += distance) {
        bgCanvasCtx.fillRect(x, y, pixelDensity, pixelDensity);
      }
    }
  }
  return bgCanvas;
}

export default function Vis({ analyser }: Props) {
  useLayoutEffect(() => {
    analyser.fftSize = 1024;
  }, [analyser, analyser.fftSize]);

  const colors = useTypedSelector(Selectors.getSkinColors);
  const mode = useTypedSelector(Selectors.getVisualizerStyle);
  const audioStatus = useTypedSelector(Selectors.getMediaStatus);
  const getWindowShade = useTypedSelector(Selectors.getWindowShade);
  const getWindowOpen = useTypedSelector(Selectors.getWindowOpen);
  const isMWOpen = getWindowOpen("main");
  const doubled = useTypedSelector(Selectors.getDoubled);
  const toggleVisualizerStyle = useActionCreator(Actions.toggleVisualizerStyle);
  const windowShade = getWindowShade("main");

  const smallVis = windowShade && isMWOpen;
  const renderHeight = smallVis ? 5 : 16;
  const renderWidth = 76;
  const pixelDensity = doubled && smallVis ? 2 : 1;

  let renderWidthBG: number;
  if (!isMWOpen) {
    renderWidthBG = renderWidth;
  } else if (windowShade) {
    renderWidthBG = doubled ? renderWidth : 38;
  } else {
    renderWidthBG = renderWidth * pixelDensity;
  }

  const width = renderWidth * pixelDensity;
  const height = renderHeight * pixelDensity;

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  //? painter administration
  const painter = useMemo(() => {
    if (!canvas) return null;
    const cfg = {
      canvas,
      analyser,
      colors,
      mode:
        mode === VISUALIZERS.BAR
          ? "bars"
          : mode === VISUALIZERS.OSCILLOSCOPE
          ? "oscilloscope"
          : "none",
      renderHeight,
      smallVis,
      pixelDensity,
      doubled,
      isMWOpen,
      peaks: true,
      oscStyle: "lines",
      bandwidth: "wide",
      coloring: "normal",
    };
    return createVisualizerEngine(cfg);
  }, [
    analyser,
    canvas,
    mode,
    colors,
    renderHeight,
    smallVis,
    pixelDensity,
    doubled,
    isMWOpen,
    smallVis,
  ]);

  // reacts to changes in doublesize mode
  useEffect(() => {
    if (canvas && painter) {
      const canvasCtx = canvas.getContext("2d");
      if (canvasCtx) {
        painter.prepare();
        // wipes the canvas clean if playback is paused and doubled is changing
        if (audioStatus === MEDIA_STATUS.PAUSED) {
          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
    // TODO: Double check expected behavior when pause state changes.
    // Here we ignore the audioStatus dependency because we don't
    // want to clear the canvas when the audio is paused.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doubled, canvas, painter]);

  useEffect(() => {
    if (canvas == null || painter == null) {
      return;
    }

    const canvasCtx = canvas.getContext("2d");
    if (canvasCtx == null) {
      return;
    }
    canvasCtx.imageSmoothingEnabled = false;

    let animationRequest: number | null = null;

    const loop = () => {
      painter.paintFrame();
      animationRequest = window.requestAnimationFrame(loop);
    };

    if (audioStatus === MEDIA_STATUS.PLAYING) {
      if (mode === VISUALIZERS.NONE) {
        canvasCtx.clearRect(0, 0, renderWidthBG, height);
      } else {
        loop();
      }
    }

    return () => {
      if (animationRequest !== null) {
        window.cancelAnimationFrame(animationRequest);
      }
    };
  }, [audioStatus, canvas, painter, renderWidthBG, height, mode]);

  if (audioStatus === MEDIA_STATUS.STOPPED) {
    return null;
  }

  return (
    <canvas
      id="visualizer"
      ref={setCanvas}
      style={{ width: renderWidth, height: renderHeight }}
      width={width}
      height={height}
      onClick={toggleVisualizerStyle}
    />
  );
}
