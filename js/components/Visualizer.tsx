import React, { useMemo, useCallback, useState, useLayoutEffect } from "react";

import * as Actions from "../actionCreators";
import * as Selectors from "../selectors";
import { useTypedSelector, useActionCreator } from "../hooks";
import VisualizerInner from "./VisualizerInner";
import { VISUALIZERS } from "../constants";

const PIXEL_DENSITY = 2;
const BAR_WIDTH = 3 * PIXEL_DENSITY;
const GRADIENT_COLOR_COUNT = 16;
const PEAK_COLOR_INDEX = 23;
const NUM_BARS = 20;

type Props = {
  analyser: AnalyserNode;
};

function octaveBucketsForBufferLength(bufferLength: number): number[] {
  const octaveBuckets = new Array(NUM_BARS).fill(0);
  const minHz = 200;
  const maxHz = 22050;
  const octaveStep = Math.pow(maxHz / minHz, 1 / NUM_BARS);

  octaveBuckets[0] = 0;
  octaveBuckets[1] = minHz;
  for (let i = 2; i < NUM_BARS - 1; i++) {
    octaveBuckets[i] = octaveBuckets[i - 1] * octaveStep;
  }
  octaveBuckets[NUM_BARS - 1] = maxHz;

  for (let i = 0; i < NUM_BARS; i++) {
    const octaveIdx = Math.floor((octaveBuckets[i] / maxHz) * bufferLength);
    octaveBuckets[i] = octaveIdx;
  }

  return octaveBuckets;
}

// Return the average value in a slice of dataArray
function sliceAverage(
  dataArray: Uint8Array,
  sliceWidth: number,
  sliceNumber: number
): number {
  const start = sliceWidth * sliceNumber;
  const end = start + sliceWidth;
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += dataArray[i];
  }
  return sum / sliceWidth;
}

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

function preRenderBar(
  height: number,
  colors: string[],
  renderHeight: number
): HTMLCanvasElement {
  /**
   * The order of the colours is commented in the file: the fist two colours
   * define the background and dots (check it to see what are the dots), the
   * next 16 colours are the analyzer's colours from top to bottom, the next
   * 5 colours are the oscilloscope's ones, from center to top/bottom, the
   * last colour is for the analyzer's peak markers.
   */

  // Off-screen canvas for pre-rendering a single bar gradient
  const barCanvas = document.createElement("canvas");
  barCanvas.width = BAR_WIDTH;
  barCanvas.height = height;

  const offset = 2; // The first two colors are for the background;
  const gradientColors = colors.slice(offset, offset + GRADIENT_COLOR_COUNT);

  const barCanvasCtx = barCanvas.getContext("2d");
  if (barCanvasCtx == null) {
    throw new Error("Could not construct canvas context");
  }
  const multiplier = GRADIENT_COLOR_COUNT / renderHeight;
  // In shade mode, the five colors are, from top to bottom:
  // 214, 102, 0 -- 3
  // 222, 165, 24 -- 6
  // 148, 222, 33 -- 9
  // 57, 181, 16 -- 12
  // 24, 132, 8 -- 15
  // TODO: This could probably be improved by iterating backwards
  for (let i = 0; i < renderHeight; i++) {
    const colorIndex = GRADIENT_COLOR_COUNT - 1 - Math.floor(i * multiplier);
    barCanvasCtx.fillStyle = gradientColors[colorIndex];
    const y = height - i * PIXEL_DENSITY;
    barCanvasCtx.fillRect(0, y, BAR_WIDTH, PIXEL_DENSITY);
  }
  return barCanvas;
}
function Visualizer(props: Props) {
  useLayoutEffect(() => {
    props.analyser.fftSize = 2048;
  }, [props.analyser]);
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
  const bufferLength = useMemo(() => {
    switch (style) {
      case VISUALIZERS.OSCILLOSCOPE:
        return props.analyser.fftSize;
      case VISUALIZERS.BAR:
        return props.analyser.frequencyBinCount;
      default:
        return 0;
    }
  }, [props.analyser.fftSize, props.analyser.frequencyBinCount, style]);

  const dataArray = useMemo(() => {
    return new Uint8Array(bufferLength);
  }, [bufferLength]);
  const octaveBuckets = useMemo(() => {
    return octaveBucketsForBufferLength(bufferLength);
  }, [bufferLength]);

  const bgCanvas = useMemo(() => {
    return preRenderBg(
      width,
      height,
      colors[0],
      colors[1],
      Boolean(windowShade)
    );
  }, [colors, height, width, windowShade]);

  const barCanvas = useMemo(() => {
    return preRenderBar(height, colors, renderHeight);
  }, [colors, height, renderHeight]);

  const printBar = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      barHeight: number,
      peakHeight: number
    ) => {
      barHeight = Math.ceil(barHeight) * PIXEL_DENSITY;
      peakHeight = Math.ceil(peakHeight) * PIXEL_DENSITY;
      if (barHeight > 0 || peakHeight > 0) {
        const y = height - barHeight;
        // Draw the gradient
        const b = BAR_WIDTH;
        if (height > 0) {
          ctx.drawImage(barCanvas, 0, y, b, height, x, y, b, height);
        }

        // Draw the gray peak line
        if (!windowShade) {
          const peakY = height - peakHeight;
          ctx.fillStyle = colors[PEAK_COLOR_INDEX];
          ctx.fillRect(x, peakY, b, PIXEL_DENSITY);
        }
      }
    },
    [barCanvas, colors, height, windowShade]
  );

  const paintOscilloscopeFrame = useCallback(
    (canvasCtx: CanvasRenderingContext2D) => {
      props.analyser.getByteTimeDomainData(dataArray);

      canvasCtx.lineWidth = PIXEL_DENSITY;

      // Just use one of the viscolors for now
      canvasCtx.strokeStyle = colors[18];

      // Since dataArray has more values than we have pixels to display, we
      // have to average several dataArray values per pixel. We call these
      // groups slices.
      //
      // We use the  2x scale here since we only want to plot values for
      // "real" pixels.
      const sliceWidth = Math.floor(bufferLength / width) * PIXEL_DENSITY;

      const h = height;

      canvasCtx.beginPath();

      // Iterate over the width of the canvas in "real" pixels.
      for (let j = 0; j <= renderWidth; j++) {
        const amplitude = sliceAverage(dataArray, sliceWidth, j);
        const percentAmplitude = amplitude / 255; // dataArray gives us bytes
        const y = (1 - percentAmplitude) * h; // flip y
        const x = j * PIXEL_DENSITY;

        // Canvas coordinates are in the middle of the pixel by default.
        // When we want to draw pixel perfect lines, we will need to
        // account for that here
        if (x === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
      }
      canvasCtx.stroke();
    },
    [
      bufferLength,
      colors,
      dataArray,
      height,
      props.analyser,
      renderWidth,
      width,
    ]
  );

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
    barCanvas,
    printBar,
    paintOscilloscopeFrame,
    bufferLength,
    dataArray,
    octaveBuckets,
  };
  return <VisualizerInner {...innerProps} {...props} />;
}

export default Visualizer;
