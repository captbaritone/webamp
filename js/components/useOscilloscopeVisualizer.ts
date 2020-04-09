import { useMemo, useCallback } from "react";

import * as Selectors from "../selectors";
import { useTypedSelector } from "../hooks";

const PIXEL_DENSITY = 2;

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

export function usePaintOscilloscopeFrame({
  analyser,
  height,
  width,
  renderWidth,
}: {
  analyser: AnalyserNode;
  height: number;
  width: number;
  renderWidth: number;
}) {
  const colors = useTypedSelector(Selectors.getSkinColors);

  const bufferLength = analyser.fftSize;

  const dataArray = useMemo(() => {
    return new Uint8Array(bufferLength);
  }, [bufferLength]);

  return useCallback(
    (canvasCtx: CanvasRenderingContext2D) => {
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
    [analyser, bufferLength, colors, dataArray, height, renderWidth, width]
  );
}
