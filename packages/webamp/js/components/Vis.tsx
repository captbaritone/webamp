import React, { useMemo, useState, useLayoutEffect, useEffect } from "react";

import * as Actions from "../actionCreators";
import * as Selectors from "../selectors";
import { useTypedSelector, useActionCreator } from "../hooks";
import { VISUALIZERS, MEDIA_STATUS } from "../constants";

import {
  Vis as IVis,
  BarPaintHandler,
  WavePaintHandler,
  NoVisualizerHandler,
} from "./VisPainter";

type Props = {
  analyser: AnalyserNode;
};

// Pre-render the background grid
function preRenderBg(
  width: number,
  height: number,
  bgColor: string,
  fgColor: string,
  windowShade: boolean,
  pixelDensity: number
): HTMLCanvasElement {
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
  const renderWidthBG = !isMWOpen
    ? renderWidth
    : windowShade
    ? doubled
      ? renderWidth
      : 38
    : renderWidth * pixelDensity;

  const width = renderWidth * pixelDensity;
  const height = renderHeight * pixelDensity;

  const bgCanvas = useMemo(() => {
    return preRenderBg(
      renderWidthBG,
      height,
      colors[0],
      colors[1],
      Boolean(windowShade),
      pixelDensity
    );
  }, [colors, height, renderWidthBG, windowShade, pixelDensity]);

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  //? painter administration
  const painter = useMemo(() => {
    if (!canvas) return null;

    const vis: IVis = {
      canvas,
      colors,
      analyser,
      oscStyle: "lines",
      bandwidth: "wide",
      coloring: "normal",
      peaks: true,
      saFalloff: "moderate",
      saPeakFalloff: "slow",
      sa: "analyzer", // unused, but hopefully will be used in the future for providing config options
      renderHeight,
      smallVis,
      pixelDensity,
      doubled,
      isMWOpen,
    };

    switch (mode) {
      case VISUALIZERS.OSCILLOSCOPE:
        return new WavePaintHandler(vis);
      case VISUALIZERS.BAR:
        return new BarPaintHandler(vis);
      case VISUALIZERS.NONE:
        return new NoVisualizerHandler(vis);
      default:
        return new NoVisualizerHandler(vis);
    }
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
      canvasCtx.drawImage(bgCanvas, 0, 0);
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
  }, [audioStatus, canvas, painter, bgCanvas, renderWidthBG, height, mode]);

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
