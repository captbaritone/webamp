import React, { useMemo, useState, useLayoutEffect, useEffect } from "react";

import * as Actions from "../actionCreators";
import * as Selectors from "../selectors";
import { useTypedSelector, useActionCreator } from "../hooks";
import { VISUALIZERS, MEDIA_STATUS } from "../constants";
import { createVisualizerEngine } from "./VisualizerEngine";

type Props = {
  analyser: AnalyserNode;
};

function resolveMode(mode: unknown): "bars" | "oscilloscope" | "none" {
  if (mode === VISUALIZERS.BAR) return "bars";
  if (mode === VISUALIZERS.OSCILLOSCOPE) return "oscilloscope";
  return "none";
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
  const isMWOpen = getWindowOpen("main") ?? false;
  const doubled = useTypedSelector(Selectors.getDoubled);
  const toggleVisualizerStyle = useActionCreator(Actions.toggleVisualizerStyle);
  const windowShade = getWindowShade("main") ?? false;

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
    return createVisualizerEngine({
      canvas,
      analyser,
      colors,
      mode: resolveMode(mode),
      renderHeight: 16,
      smallVis: false,
      pixelDensity: 1,
      doubled: false,
      isMWOpen: false,
      peaks: true,
      oscStyle: "lines",
      bandwidth: "wide",
      coloring: "normal",
    });
  }, [analyser, canvas, mode, colors]);

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

  // updates painter configuration when layout changes (windowShade, main window open/closed)
  // without recreating the painter, preserving visualizer state
  useEffect(() => {
    if (painter) {
      painter.updateConfig({
        doubled,
        isMWOpen,
        smallVis,
      });
    }
  }, [doubled, isMWOpen, smallVis, painter]);

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
