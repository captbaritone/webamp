import React, { useMemo, useState, useEffect, useRef } from "react";
import { connect } from "react-redux";

import { toggleVisualizerStyle } from "../actionCreators";
import { getWindowShade, getVisualizerStyle } from "../selectors";
import { VISUALIZERS, MEDIA_STATUS } from "../constants";
import {
  preRenderBg,
  preRenderBar,
  paintOscilloscopeFrame,
  octaveBucketsForBufferLength,
  paintBarFrame,
  NUM_BARS,
  PIXEL_DENSITY,
} from "./visualizerUtils";
import { useAnimationLoop } from "../hooks";

function Wrapper(props) {
  const [barPeaks] = useState(() => new Array(NUM_BARS).fill(0));
  const [barPeakFrames] = useState(() => new Array(NUM_BARS).fill(0));
  const renderWidth = props.canvasWidth;
  const renderHeight = props.canvasHeight;
  const height = props.canvasHeight * PIXEL_DENSITY;
  const width = props.canvasWidth * PIXEL_DENSITY;

  const bgCanvas = useMemo(() => {
    return preRenderBg(
      width,
      height,
      props.colors[0],
      props.colors[1],
      props.windowShade
    );
  }, [height, props.colors, props.windowShade, width]);

  const barCanvas = useMemo(() => {
    return preRenderBar(height, props.colors, renderHeight);
  }, [height, props.colors, renderHeight]);

  useEffect(() => {
    props.analyser.fftSize = 2048;
  }, [props.analyser]);

  const dataArray = useMemo(() => {
    if (props.style === VISUALIZERS.OSCILLOSCOPE) {
      return new Uint8Array(props.analyser.fftSize);
    } else if (props.style === VISUALIZERS.BAR) {
      return new Uint8Array(props.analyser.frequencyBinCount);
    }
  }, [props.analyser.fftSize, props.analyser.frequencyBinCount, props.style]);

  const octaveBuckets = useMemo(() => {
    return octaveBucketsForBufferLength(dataArray.length);
  }, [dataArray.length]);

  const paintFrame = useMemo(() => {
    if (dataArray == null || props.status !== MEDIA_STATUS.PLAYING) {
      return null;
    }
    return canvasCtx => {
      switch (props.style) {
        case VISUALIZERS.OSCILLOSCOPE:
          canvasCtx.drawImage(bgCanvas, 0, 0);
          paintOscilloscopeFrame({
            analyser: props.analyser,
            dataArray,
            canvasCtx,
            height,
            width,
            colors: props.colors,
            renderWidth,
          });
          break;
        case VISUALIZERS.BAR:
          canvasCtx.drawImage(bgCanvas, 0, 0);
          paintBarFrame({
            analyser: props.analyser,
            dataArray,
            renderHeight,
            octaveBuckets,
            barPeaks,
            barPeakFrames,
            height,
            canvasCtx,
            barCanvas,
            windowShade: props.windowShade,
            colors: props.colors,
          });
          break;
        default:
          this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    };
  }, [
    barCanvas,
    barPeakFrames,
    barPeaks,
    bgCanvas,
    dataArray,
    height,
    octaveBuckets,
    props.analyser,
    props.colors,
    props.status,
    props.style,
    props.windowShade,
    renderHeight,
    renderWidth,
    width,
  ]);

  const visualizerProps = {
    ...props,
    renderHeight,
    renderWidth,
    height,
    width,
    paintFrame,
  };

  return <Visualizer {...visualizerProps} />;
}

function Visualizer(props) {
  const canvasRef = useRef(null);

  useAnimationLoop({ canvas: canvasRef.current, paintFrame: props.paintFrame });

  const { renderWidth, renderHeight, width, height } = props;
  return (
    <canvas
      id="visualizer"
      ref={canvasRef}
      style={{ width: renderWidth, height: renderHeight }}
      width={width}
      height={height}
      onClick={props.toggleVisualizerStyle}
    />
  );
}

const mapStateToProps = state => ({
  colors: state.display.skinColors,
  style: getVisualizerStyle(state),
  canvasWidth: getWindowShade(state)("main") ? 38 : 76,
  canvasHeight: getWindowShade(state)("main") ? 5 : 16,
  status: state.media.status,
  windowShade: getWindowShade(state)("main"),
  dummyVizData: state.display.dummyVizData,
});

const mapDispatchToProps = {
  toggleVisualizerStyle,
};

export default connect(mapStateToProps, mapDispatchToProps)(Wrapper);
