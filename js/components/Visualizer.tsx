import React, { useMemo, useEffect, useState } from "react";

import * as Actions from "../actionCreators";
import * as Selectors from "../selectors";
import { VISUALIZERS, MEDIA_STATUS } from "../constants";
import {
  preRenderBg,
  usePaintOscilloscope,
  PIXEL_DENSITY,
  usePaintBars,
  usePaintDummyBarFrame,
} from "./visualizerUtils";
import { useAnimationLoop, useTypedSelector, useActionCreator } from "../hooks";

type Props = {
  analyser: AnalyserNode;
};

export default function Visualizer({ analyser }: Props) {
  const windowShade = useTypedSelector(Selectors.getWindowShade)("main")!;
  const renderWidth = windowShade ? 38 : 76;
  const renderHeight = windowShade ? 5 : 16;
  const colors = useTypedSelector(Selectors.getSkinColors);
  const style = useTypedSelector(Selectors.getVisualizerStyle);
  const status = useTypedSelector(Selectors.getMediaStatus);
  const dummyVizData = useTypedSelector(Selectors.getDummyVizData);
  const toggleVisualizerStyle = useActionCreator(Actions.toggleVisualizerStyle);

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const height = renderHeight * PIXEL_DENSITY;
  const width = renderWidth * PIXEL_DENSITY;

  const canvasCtx = useMemo(() => {
    return canvas?.getContext("2d") ?? null;
  }, [canvas]);

  const bgCanvas = useMemo(() => {
    return preRenderBg(width, height, colors[0], colors[1], windowShade);
  }, [colors, height, width, windowShade]);

  useEffect(() => {
    if (style === VISUALIZERS.OSCILLOSCOPE || style === VISUALIZERS.BAR) {
      analyser.fftSize = 2048;
    }
  }, [analyser.fftSize, style]);

  const paintBars = usePaintBars({
    analyser,
    canvasCtx,
    renderHeight,
    height,
    windowShade,
    colors,
  });

  const paintOscilloscope = usePaintOscilloscope({
    analyser,
    canvasCtx,
    renderWidth,
    width,
    height,
    colors,
  });

  const paintDummyFrame = usePaintDummyBarFrame({
    dummyVizData,
    height,
    canvasCtx,
    windowShade,
    colors,
    renderHeight,
  });

  const paintFrame = useMemo(() => {
    if (canvasCtx == null || status !== MEDIA_STATUS.PLAYING) {
      return null;
    }
    if (dummyVizData != null) {
      return paintDummyFrame;
    }
    switch (style) {
      case VISUALIZERS.OSCILLOSCOPE:
        return () => {
          canvasCtx.drawImage(bgCanvas, 0, 0);
          paintOscilloscope();
        };
      case VISUALIZERS.BAR:
        return () => {
          canvasCtx.drawImage(bgCanvas, 0, 0);
          paintBars();
        };
    }
    return null;
  }, [
    bgCanvas,
    canvasCtx,
    dummyVizData,
    paintBars,
    paintDummyFrame,
    paintOscilloscope,
    status,
    style,
  ]);

  useAnimationLoop({ paintFrame });

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
