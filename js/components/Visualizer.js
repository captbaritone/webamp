import React from "react";
import { connect } from "react-redux";

import { toggleVisualizerStyle } from "../actionCreators";
import { getWindowShade, getVisualizerStyle } from "../selectors";
import { VISUALIZERS, MEDIA_STATUS } from "../constants";
import {
  preRenderBg,
  preRenderBar,
  paintOscilloscopeFrame,
  octaveBucketsForBufferLength,
  printBar,
  NUM_BARS,
  BAR_WIDTH,
  PIXEL_DENSITY,
  BAR_PEAK_DROP_RATE,
} from "./visualizerUtils";

class Visualizer extends React.Component {
  componentDidMount() {
    this.barPeaks = new Array(NUM_BARS).fill(0);
    this.barPeakFrames = new Array(NUM_BARS).fill(0);
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

  _renderWidth() {
    return this.props.width;
  }

  _renderHeight() {
    return this.props.height;
  }

  _height() {
    return this.props.height * PIXEL_DENSITY;
  }

  _width() {
    return this.props.width * PIXEL_DENSITY;
  }

  setStyle() {
    if (!this.props.colors) {
      return;
    }
    // TODO: Split this into to methods. One for skin update, one for style
    // update.
    this.preRenderBg();
    this.preRenderBar();
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

  // Pre-render the background grid
  preRenderBg() {
    this.bgCanvas = preRenderBg(
      this._width(),
      this._height(),
      this.props.colors[0],
      this.props.colors[1],
      this.props.windowShade
    );
  }

  // Pre-render the bar gradient
  preRenderBar() {
    this.barCanvas = preRenderBar(
      this._height(),
      this.props.colors,
      this._renderHeight()
    );
  }

  paintFrame() {
    switch (this.props.style) {
      case VISUALIZERS.OSCILLOSCOPE:
        this.canvasCtx.drawImage(this.bgCanvas, 0, 0);
        paintOscilloscopeFrame({
          analyser: this.props.analyser,
          dataArray: this.dataArray,
          canvasCtx: this.canvasCtx,
          height: this._height(),
          width: this._width(),
          bufferLength: this.bufferLength,
          colors: this.props.colors,
          renderWidth: this._renderWidth(),
        });
        break;
      case VISUALIZERS.BAR:
        this.canvasCtx.drawImage(this.bgCanvas, 0, 0);
        this._paintBarFrame();
        break;
      default:
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  _paintBarFrame() {
    this.props.analyser.getByteFrequencyData(this.dataArray);
    const heightMultiplier = this._renderHeight() / 256;
    const xOffset = BAR_WIDTH + PIXEL_DENSITY; // Bar width, plus a pixel of spacing to the right.
    for (let j = 0; j < NUM_BARS - 1; j++) {
      const start = this.octaveBuckets[j];
      const end = this.octaveBuckets[j + 1];
      let amplitude = 0;
      for (let k = start; k < end; k++) {
        amplitude += this.dataArray[k];
      }
      amplitude /= end - start;

      // The drop rate should probably be normalized to the rendering FPS, for now assume 60 FPS
      let barPeak =
        this.barPeaks[j] -
        BAR_PEAK_DROP_RATE * Math.pow(this.barPeakFrames[j], 2);
      if (barPeak < amplitude) {
        barPeak = amplitude;
        this.barPeakFrames[j] = 0;
      } else {
        this.barPeakFrames[j] += 1;
      }
      this.barPeaks[j] = barPeak;

      printBar({
        x: j * xOffset,
        _height: amplitude * heightMultiplier,
        peakHeight: barPeak * heightMultiplier,
        height: this._height(),
        canvasCtx: this.canvasCtx,
        barCanvas: this.barCanvas,
        windowShade: this.props.windowShade,
        colors: this.props.colors,
      });
    }
  }

  render() {
    const { width, height } = this.props;
    return (
      <canvas
        id="visualizer"
        ref={node => (this.canvas = node)}
        style={{ width, height }}
        width={width * PIXEL_DENSITY}
        height={height * PIXEL_DENSITY}
        onClick={this.props.toggleVisualizerStyle}
      />
    );
  }
}

const mapStateToProps = state => ({
  colors: state.display.skinColors,
  style: getVisualizerStyle(state),
  width: getWindowShade(state)("main") ? 38 : 76,
  height: getWindowShade(state)("main") ? 5 : 16,
  status: state.media.status,
  windowShade: getWindowShade(state)("main"),
  dummyVizData: state.display.dummyVizData,
});

const mapDispatchToProps = {
  toggleVisualizerStyle,
};

export default connect(mapStateToProps, mapDispatchToProps)(Visualizer);
