import { useCallback, useMemo, useState } from "react";
import { DummyVizData } from "../types";
export const PIXEL_DENSITY = 2;
export const NUM_BARS = 20;
export const BAR_WIDTH = 3 * PIXEL_DENSITY;
export const BAR_PEAK_DROP_RATE = 0.01;
export const GRADIENT_COLOR_COUNT = 16;
export const PEAK_COLOR_INDEX = 23;

type UsePaintBarsOptions = {
  analyser: AnalyserNode;
  canvasCtx: CanvasRenderingContext2D | null;
  renderHeight: number;
  height: number;
  windowShade: boolean;
  colors: string[];
};

export function usePaintBars({
  analyser,
  canvasCtx,
  renderHeight,
  height,
  windowShade,
  colors,
}: UsePaintBarsOptions) {
  const [barPeaks] = useState(() => new Array(NUM_BARS).fill(0));
  const [barPeakFrames] = useState(() => new Array(NUM_BARS).fill(0));

  const barCanvas = useMemo(() => {
    return preRenderBar(height, colors, renderHeight);
  }, [colors, height, renderHeight]);

  const dataArray = useMemo(() => {
    return new Uint8Array(analyser.frequencyBinCount);
  }, [analyser.frequencyBinCount]);

  const octaveBuckets = useMemo(() => {
    return octaveBucketsForBufferLength(dataArray.length);
  }, [dataArray.length]);

  return useCallback(() => {
    if (canvasCtx == null) {
      return;
    }
    paintBarFrame({
      analyser,
      dataArray,
      renderHeight,
      octaveBuckets,
      barPeaks,
      barPeakFrames,
      height,
      canvasCtx,
      barCanvas,
      windowShade,
      colors,
    });
  }, [
    analyser,
    barCanvas,
    barPeakFrames,
    barPeaks,
    canvasCtx,
    colors,
    dataArray,
    height,
    octaveBuckets,
    renderHeight,
    windowShade,
  ]);
}

type UsePaintOscilloscopeOptions = {
  analyser: AnalyserNode;
  canvasCtx: CanvasRenderingContext2D | null;
  renderWidth: number;
  height: number;
  width: number;
  colors: string[];
};

export function usePaintOscilloscope({
  canvasCtx,
  analyser,
  height,
  colors,
  width,
  renderWidth,
}: UsePaintOscilloscopeOptions) {
  const dataArray = useMemo(() => {
    return new Uint8Array(analyser.fftSize);
  }, [analyser.fftSize]);

  return useCallback(() => {
    if (canvasCtx == null) {
      return;
    }
    paintOscilloscopeFrame({
      analyser,
      dataArray,
      canvasCtx,
      height,
      width,
      colors,
      renderWidth,
    });
  }, [analyser, canvasCtx, colors, dataArray, height, renderWidth, width]);
}

// Pre-render the background grid
export function preRenderBg(
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

  const bgCanvasCtx = bgCanvas.getContext("2d")!;
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

  const barCanvasCtx = barCanvas.getContext("2d")!;
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

// Return the average value in a slice of dataArray
function sliceAverage(
  dataArray: Uint8Array,
  sliceWidth: number,
  sliceNumber: number
) {
  const start = sliceWidth * sliceNumber;
  const end = start + sliceWidth;
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += dataArray[i];
  }
  return sum / sliceWidth;
}

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

// Rendering Functions

function paintOscilloscopeFrame({
  analyser,
  dataArray,
  canvasCtx,
  height,
  width,
  colors,
  renderWidth,
}: {
  analyser: AnalyserNode;
  dataArray: Uint8Array;
  canvasCtx: CanvasRenderingContext2D;
  height: number;
  width: number;
  colors: string[];
  renderWidth: number;
}) {
  analyser.getByteTimeDomainData(dataArray);

  canvasCtx.lineWidth = PIXEL_DENSITY;

  // Just use one of the viscolors for now
  canvasCtx.strokeStyle = colors[18];

  // Since dataArray has more values than we have pixels to display, we
  // have to average several dataArray values per pixel. We call these
  // groups slices.
  //
  // We use the  2x scale here since we only want to plot values for
  // "real" pixels.
  const sliceWidth = Math.floor(dataArray.length / width) * PIXEL_DENSITY;

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
}

export function usePaintDummyBarFrame({
  dummyVizData,
  height,
  canvasCtx,
  windowShade,
  colors,
  renderHeight,
}: {
  dummyVizData: DummyVizData | null;
  height: number;
  canvasCtx: CanvasRenderingContext2D | null;
  windowShade: boolean;
  colors: string[];
  renderHeight: number;
}) {
  const barCanvas = useMemo(() => {
    return preRenderBar(height, colors, renderHeight);
  }, [colors, height, renderHeight]);

  return useCallback(() => {
    if (dummyVizData == null || canvasCtx == null) {
      return;
    }
    Object.entries(dummyVizData).forEach(([i, _height]) => {
      printBar({
        x: Number(i),
        _height,
        peakHeight: Infinity,
        height,
        canvasCtx,
        barCanvas,
        windowShade,
        colors,
      });
    });
  }, [barCanvas, canvasCtx, colors, dummyVizData, height, windowShade]);
}

function paintBarFrame({
  analyser,
  dataArray,
  renderHeight,
  octaveBuckets,
  barPeaks,
  barPeakFrames,
  height,
  canvasCtx,
  barCanvas,
  windowShade,
  colors,
}: {
  analyser: AnalyserNode;
  dataArray: Uint8Array /* MUTABLE */;
  renderHeight: number;
  octaveBuckets: number[];
  barPeaks: number[] /* MUTABLE */;
  barPeakFrames: number[] /* MUTABLE */;
  height: number;
  canvasCtx: CanvasRenderingContext2D;
  barCanvas: HTMLCanvasElement;
  windowShade: boolean;
  colors: string[];
}) {
  analyser.getByteFrequencyData(dataArray);
  const heightMultiplier = renderHeight / 256;
  const xOffset = BAR_WIDTH + PIXEL_DENSITY; // Bar width, plus a pixel of spacing to the right.
  for (let j = 0; j < NUM_BARS - 1; j++) {
    const start = octaveBuckets[j];
    const end = octaveBuckets[j + 1];
    let amplitude = 0;
    for (let k = start; k < end; k++) {
      amplitude += dataArray[k];
    }
    amplitude /= end - start;

    // The drop rate should probably be normalized to the rendering FPS, for now assume 60 FPS
    let barPeak =
      barPeaks[j] - BAR_PEAK_DROP_RATE * Math.pow(barPeakFrames[j], 2);
    if (barPeak < amplitude) {
      barPeak = amplitude;
      barPeakFrames[j] = 0;
    } else {
      barPeakFrames[j] += 1;
    }
    barPeaks[j] = barPeak;

    printBar({
      x: j * xOffset,
      _height: amplitude * heightMultiplier,
      peakHeight: barPeak * heightMultiplier,
      height,
      canvasCtx,
      barCanvas,
      windowShade,
      colors,
    });
  }
}

function printBar({
  x,
  _height,
  peakHeight,
  height,
  canvasCtx,
  barCanvas,
  windowShade,
  colors,
}: {
  x: number;
  _height: number;
  peakHeight: number;
  height: number;
  canvasCtx: CanvasRenderingContext2D;
  barCanvas: HTMLCanvasElement;
  windowShade: boolean;
  colors: string[];
}) {
  const barHeight = Math.ceil(_height) * PIXEL_DENSITY;
  peakHeight = Math.ceil(peakHeight) * PIXEL_DENSITY;
  if (barHeight < 1 || peakHeight < 1) {
    return;
  }
  const y = height - barHeight;
  const ctx = canvasCtx;
  // Draw the gradient
  const b = BAR_WIDTH;
  if (barHeight > 0) {
    ctx.drawImage(barCanvas, 0, y, b, barHeight, x, y, b, barHeight);
  }

  // Draw the gray peak line
  if (!windowShade) {
    const peakY = height - peakHeight;
    ctx.fillStyle = colors[PEAK_COLOR_INDEX];
    ctx.fillRect(x, peakY, b, PIXEL_DENSITY);
  }
}
