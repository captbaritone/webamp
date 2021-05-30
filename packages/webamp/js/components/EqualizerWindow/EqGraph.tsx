import { useState, useMemo, useLayoutEffect } from "react";
import { percentToRange, clamp } from "../../utils";
import { BANDS } from "../../constants";
import spline from "./spline";
import * as Selectors from "../../selectors";
import { usePromiseValueOrNull, useTypedSelector } from "../../hooks";
import { Slider } from "../../types";

const GRAPH_HEIGHT = 19;
const GRAPH_WIDTH = 113;

function EqGraph() {
  const sliders = useTypedSelector(Selectors.getSliders);

  const preampLineImagePromise = useTypedSelector(Selectors.getPreampLineImage);
  const preampLineImage = usePromiseValueOrNull(preampLineImagePromise);

  const [canvasNode, setCanvasNode] = useState<HTMLCanvasElement | null>(null);

  const canvasCtx = useMemo(
    () => canvasNode?.getContext("2d") ?? null,
    [canvasNode]
  );
  const colorPattern = useColorPattern(canvasCtx);

  useLayoutEffect(() => {
    if (
      canvasCtx == null ||
      canvasNode == null ||
      preampLineImage == null ||
      colorPattern == null
    ) {
      return;
    }
    const width = Number(canvasNode.width);
    const height = Number(canvasNode.height);
    canvasCtx.clearRect(0, 0, width, height);
    drawEqLine({ colorPattern, sliders, canvasCtx, preampLineImage });
  }, [canvasCtx, canvasNode, colorPattern, preampLineImage, sliders]);

  return (
    <canvas
      id="eqGraph"
      ref={setCanvasNode}
      width={GRAPH_WIDTH}
      height={GRAPH_HEIGHT}
    />
  );
}

function useColorPattern(canvasCtx: CanvasRenderingContext2D | null) {
  const lineColorsImagePromise = useTypedSelector(Selectors.getLineColorsImage);
  const lineColorsImage = usePromiseValueOrNull(lineColorsImagePromise);
  return useMemo(() => {
    if (canvasCtx == null || lineColorsImage == null) {
      return null;
    }
    return canvasCtx.createPattern(lineColorsImage, "repeat-x");
  }, [canvasCtx, lineColorsImage]);
}

function drawEqLine({
  colorPattern,
  sliders,
  canvasCtx,
  preampLineImage,
}: {
  sliders: Record<Slider, number>;
  colorPattern: CanvasPattern;
  preampLineImage: HTMLImageElement;
  canvasCtx: CanvasRenderingContext2D;
}) {
  const preampValue = percentToRange(sliders.preamp / 100, 0, GRAPH_HEIGHT - 1);
  canvasCtx.drawImage(
    preampLineImage,
    0,
    preampValue,
    preampLineImage.width,
    preampLineImage.height
  );

  const amplitudes = BANDS.map((band) => sliders[band]);

  canvasCtx.fillStyle = colorPattern;
  const paddingLeft = 2; // TODO: This should be 1.5

  const min = 0;
  const max = GRAPH_HEIGHT - 1;

  const xs: number[] = [];
  const ys: number[] = [];
  amplitudes.forEach((value, i) => {
    const percent = (100 - value) / 100;
    // Each band is 12 pixels widex
    xs.push(i * 12);
    ys.push(percentToRange(percent, min, max));
  });

  const allYs = spline(xs, ys);

  const maxX = xs[xs.length - 1];
  let lastY = ys[0];
  for (let x = 0; x <= maxX; x++) {
    const y = clamp(Math.round(allYs[x]), 0, GRAPH_HEIGHT - 1);
    const yTop = Math.min(y, lastY);
    const height = 1 + Math.abs(lastY - y);
    canvasCtx.fillRect(paddingLeft + x, yTop, 1, height);
    lastY = y;
  }
}

export default EqGraph;
