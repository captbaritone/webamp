import React, { useMemo } from "react";

import * as Actions from "../actionCreators";
import * as Selectors from "../selectors";
import { useTypedSelector, useActionCreator } from "../hooks";
import VisualizerInner from "./VisualizerInner";

const PIXEL_DENSITY = 2;

type Props = {
  analyser: AnalyserNode;
};

// Pre-render the background grid
function preRenderBg(
  width: number,
  height: number,
  bgColor: string,
  fgColor: string,
  windowShade: boolean
) {
  // Off-screen canvas for pre-rendering the background
  const bgCanvas = document.createElement("canvas");
  bgCanvas.width = width;
  bgCanvas.height = height;
  const distance = 2 * PIXEL_DENSITY;

  const bgCanvasCtx = bgCanvas.getContext("2d");
  if (bgCanvasCtx == null) {
    throw new Error("Could not construct canvas context");
  }
  bgCanvasCtx.fillStyle = bgColor;
  bgCanvasCtx.fillRect(0, 0, width, height);
  if (!windowShade) {
    bgCanvasCtx.fillStyle = fgColor;
    for (let x = 0; x < width; x += distance) {
      for (let y = PIXEL_DENSITY; y < height; y += distance) {
        bgCanvasCtx.fillRect(x, y, PIXEL_DENSITY, PIXEL_DENSITY);
      }
    }
  }
  return bgCanvas;
}

function Visualizer(props: Props) {
  const colors = useTypedSelector(Selectors.getSkinColors);
  const style = useTypedSelector(Selectors.getVisualizerStyle);
  const status = useTypedSelector(Selectors.getMediaStatus);
  const getWindowShade = useTypedSelector(Selectors.getWindowShade);
  const dummyVizData = useTypedSelector(Selectors.getDummyVizData);

  const toggleVisualizerStyle = useActionCreator(Actions.toggleVisualizerStyle);
  const windowShade = getWindowShade("main");
  const renderWidth = windowShade ? 38 : 76;
  const renderHeight = windowShade ? 5 : 16;

  const width = renderWidth * PIXEL_DENSITY;
  const height = renderHeight * PIXEL_DENSITY;

  const bgCanvas = useMemo(() => {
    return preRenderBg(
      width,
      height,
      colors[0],
      colors[1],
      Boolean(windowShade)
    );
  }, [colors, height, width, windowShade]);

  const innerProps = {
    width: renderWidth,
    height: renderHeight,
    colors,
    style,
    status,
    windowShade,
    dummyVizData,
    toggleVisualizerStyle,
    bgCanvas,
  };
  return <VisualizerInner {...innerProps} {...props} />;
}

export default Visualizer;
