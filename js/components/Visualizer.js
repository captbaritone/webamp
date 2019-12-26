import React, { useMemo, useState } from "react";
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
  };

  return <Visualizer {...visualizerProps} />;
}

class Visualizer extends React.Component {
  componentDidMount() {
    this.canvasCtx = this.canvas.getContext("2d");
    this.canvasCtx.imageSmoothingEnabled = false;

    this.setStyle();

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
    this.setStyle();
    // Redraw the current frame, since the skin may have changed.
    this.paintFrame();
  }

  setStyle() {
    if (!this.props.colors) {
      return;
    }
    // TODO: Split this into to methods. One for skin update, one for style
    // update.
    this.props.analyser.fftSize = 2048;
    if (this.props.style === VISUALIZERS.OSCILLOSCOPE) {
      this.bufferLength = this.props.analyser.fftSize;
      this.dataArray = new Uint8Array(this.bufferLength);
    } else if (this.props.style === VISUALIZERS.BAR) {
      this.bufferLength = this.props.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);

      if (!this.octaveBuckets) {
        this.octaveBuckets = octaveBucketsForBufferLength(this.bufferLength);
      }
    }
  }

  paintFrame() {
    switch (this.props.style) {
      case VISUALIZERS.OSCILLOSCOPE:
        this.canvasCtx.drawImage(this.props.bgCanvas, 0, 0);
        paintOscilloscopeFrame({
          analyser: this.props.analyser,
          dataArray: this.dataArray,
          canvasCtx: this.canvasCtx,
          height: this.props.height,
          width: this.props.width,
          bufferLength: this.bufferLength,
          colors: this.props.colors,
          renderWidth: this.props.renderWidth,
        });
        break;
      case VISUALIZERS.BAR:
        this.canvasCtx.drawImage(this.props.bgCanvas, 0, 0);
        paintBarFrame({
          analyser: this.props.analyser,
          dataArray: this.dataArray,
          renderHeight: this.props.renderHeight,
          octaveBuckets: this.octaveBuckets,
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
