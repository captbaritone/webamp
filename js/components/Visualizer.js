import React, { useMemo, useState, useEffect } from "react";
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

  const visualizerProps = {
    ...props,
    renderHeight,
    renderWidth,
    height,
    width,
    bgCanvas,
    barCanvas,
    barPeaks,
    barPeakFrames,
    dataArray,
    octaveBuckets,
  };

  return <Visualizer {...visualizerProps} />;
}

class Visualizer extends React.Component {
  componentDidMount() {
    this.canvasCtx = this.canvas.getContext("2d");
    this.canvasCtx.imageSmoothingEnabled = false;

    // Kick off the animation loop
    const loop = () => {
      if (this.props.status === MEDIA_STATUS.PLAYING) {
        if (this.props.dummyVizData) {
          Object.keys(this.props.dummyVizData).forEach(i => {
            this._printBar(i, this.props.dummyVizData[i]);
          });
        } else {
          this.paintFrame();
        }
      }
      this._animationRequest = window.requestAnimationFrame(loop);
    };
    loop();
  }

  componentWillUnmount() {
    if (this._animationRequest) {
      window.cancelAnimationFrame(this._animationRequest);
    }
  }

  componentDidUpdate() {
    // Redraw the current frame, since the skin may have changed.
    this.paintFrame();
  }

  paintFrame() {
    switch (this.props.style) {
      case VISUALIZERS.OSCILLOSCOPE:
        this.canvasCtx.drawImage(this.props.bgCanvas, 0, 0);
        paintOscilloscopeFrame({
          analyser: this.props.analyser,
          dataArray: this.props.dataArray,
          canvasCtx: this.canvasCtx,
          height: this.props.height,
          width: this.props.width,
          colors: this.props.colors,
          renderWidth: this.props.renderWidth,
        });
        break;
      case VISUALIZERS.BAR:
        this.canvasCtx.drawImage(this.props.bgCanvas, 0, 0);
        paintBarFrame({
          analyser: this.props.analyser,
          dataArray: this.props.dataArray,
          renderHeight: this.props.renderHeight,
          octaveBuckets: this.props.octaveBuckets,
          barPeaks: this.props.barPeaks,
          barPeakFrames: this.props.barPeakFrames,
          height: this.props.height,
          canvasCtx: this.canvasCtx,
          barCanvas: this.props.barCanvas,
          windowShade: this.props.windowShade,
          colors: this.props.colors,
        });
        break;
      default:
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  render() {
    const { renderWidth, renderHeight, width, height } = this.props;
    return (
      <canvas
        id="visualizer"
        ref={node => (this.canvas = node)}
        style={{ width: renderWidth, height: renderHeight }}
        width={width}
        height={height}
        onClick={this.props.toggleVisualizerStyle}
      />
    );
  }
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
