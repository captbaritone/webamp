import { useMemo, useCallback, useState } from "react";

import * as Selectors from "../selectors";
import { useTypedSelector } from "../hooks";

const PIXEL_DENSITY = 2;
const BAR_WIDTH = 3 * PIXEL_DENSITY;
const GRADIENT_COLOR_COUNT = 16;
const PEAK_COLOR_INDEX = 23;
const BAR_PEAK_DROP_RATE = 0.01;
const NUM_BARS = 20;

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

export function usePaintBar({
  renderHeight,
  height,
}: {
  renderHeight: number;
  height: number;
}) {
  const colors = useTypedSelector(Selectors.getSkinColors);
  const getWindowShade = useTypedSelector(Selectors.getWindowShade);
  const windowShade = getWindowShade("main");

  const barCanvas = useMemo(() => {
    return preRenderBar(height, colors, renderHeight);
  }, [colors, height, renderHeight]);

  return useCallback(
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
}

export function usePaintBarFrame({
  renderHeight,
  height,
  analyser,
}: {
  renderHeight: number;
  height: number;
  analyser: AnalyserNode;
}) {
  const [barPeaks] = useState(() => new Array(NUM_BARS).fill(0));
  const [barPeakFrames] = useState(() => new Array(NUM_BARS).fill(0));
  const bufferLength = analyser.frequencyBinCount;

  const octaveBuckets = useMemo(() => {
    return octaveBucketsForBufferLength(bufferLength);
  }, [bufferLength]);

  const dataArray = useMemo(() => {
    return new Uint8Array(bufferLength);
  }, [bufferLength]);

  const paintBar = usePaintBar({ height, renderHeight });

  return useCallback(
    (canvasCtx: CanvasRenderingContext2D) => {
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

        paintBar(
          canvasCtx,
          j * xOffset,
          amplitude * heightMultiplier,
          barPeak * heightMultiplier
        );
      }
    },
    [
      analyser,
      barPeakFrames,
      barPeaks,
      dataArray,
      octaveBuckets,
      paintBar,
      renderHeight,
    ]
  );
}
