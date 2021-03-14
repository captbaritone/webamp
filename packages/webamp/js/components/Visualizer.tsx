import { useMemo, useCallback, useState, useLayoutEffect } from "react";

import * as Actions from "../actionCreators";
import * as Selectors from "../selectors";
import { useTypedSelector, useActionCreator } from "../hooks";
import { usePaintOscilloscopeFrame } from "./useOscilloscopeVisualizer";
import { usePaintBarFrame, usePaintBar } from "./useBarVisualizer";
import { VISUALIZERS, MEDIA_STATUS } from "../constants";

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
): HTMLCanvasElement {
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

function Visualizer({ analyser }: Props) {
  useLayoutEffect(() => {
    analyser.fftSize = 2048;
  }, [analyser.fftSize]);
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

  const paintOscilloscopeFrame = usePaintOscilloscopeFrame({
    analyser,
    height,
    width,
    renderWidth,
  });
  const paintBarFrame = usePaintBarFrame({
    analyser,
    height,
    renderHeight,
  });
  const paintBar = usePaintBar({ height, renderHeight });

  const paintFrame = useCallback(
    (canvasCtx: CanvasRenderingContext2D) => {
      if (status !== MEDIA_STATUS.PLAYING) {
        return;
      }
      if (dummyVizData) {
        canvasCtx.drawImage(bgCanvas, 0, 0);
        Object.entries(dummyVizData).forEach(([i, value]) => {
          paintBar(canvasCtx, Number(i), value, -1);
        });
        return;
      }
      switch (style) {
        case VISUALIZERS.OSCILLOSCOPE:
          canvasCtx.drawImage(bgCanvas, 0, 0);
          paintOscilloscopeFrame(canvasCtx);
          break;
        case VISUALIZERS.BAR:
          canvasCtx.drawImage(bgCanvas, 0, 0);
          paintBarFrame(canvasCtx);
          break;
        default:
          canvasCtx.clearRect(0, 0, width, height);
      }
    },
    [
      bgCanvas,
      dummyVizData,
      height,
      paintBar,
      paintBarFrame,
      paintOscilloscopeFrame,
      status,
      style,
      width,
    ]
  );

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    if (canvas == null) {
      return;
    }
    const canvasCtx = canvas.getContext("2d");
    if (canvasCtx == null) {
      return;
    }
    canvasCtx.imageSmoothingEnabled = false;

    let animationRequest: number | null = null;
    // Kick off the animation loop
    const loop = () => {
      paintFrame(canvasCtx);
      animationRequest = window.requestAnimationFrame(loop);
    };
    loop();

    return () => {
      if (animationRequest != null) {
        window.cancelAnimationFrame(animationRequest);
      }
    };
  }, [canvas, paintFrame]);

  if (status === MEDIA_STATUS.STOPPED) {
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

export default Visualizer;
