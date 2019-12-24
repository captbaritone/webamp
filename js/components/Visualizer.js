import React from "react";
import { connect } from "react-redux";

import { toggleVisualizerStyle } from "../actionCreators";
import { getWindowShade, getVisualizerStyle } from "../selectors";
import { VISUALIZERS, MEDIA_STATUS } from "../constants";
import {
  preRenderBg,
  preRenderBar,
  sliceAverage,
  octaveBucketsForBufferLength,
  NUM_BARS,
  BAR_WIDTH,
  PIXEL_DENSITY,
  PEAK_COLOR_INDEX,
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
        this._paintOscilloscopeFrame();
        break;
      case VISUALIZERS.BAR:
        this.canvasCtx.drawImage(this.bgCanvas, 0, 0);
        this._paintBarFrame();
        break;
      default:
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  _paintOscilloscopeFrame() {
    this.props.analyser.getByteTimeDomainData(this.dataArray);

    this.canvasCtx.lineWidth = PIXEL_DENSITY;

    // Just use one of the viscolors for now
    this.canvasCtx.strokeStyle = this.props.colors[18];

    // Since dataArray has more values than we have pixels to display, we
    // have to average several dataArray values per pixel. We call these
    // groups slices.
    //
    // We use the  2x scale here since we only want to plot values for
    // "real" pixels.
    const sliceWidth =
      Math.floor(this.bufferLength / this._width()) * PIXEL_DENSITY;

    const h = this._height();

    this.canvasCtx.beginPath();

    // Iterate over the width of the canvas in "real" pixels.
    for (let j = 0; j <= this._renderWidth(); j++) {
      const amplitude = sliceAverage(this.dataArray, sliceWidth, j);
      const percentAmplitude = amplitude / 255; // dataArray gives us bytes
      const y = (1 - percentAmplitude) * h; // flip y
      const x = j * PIXEL_DENSITY;

      // Canvas coordinates are in the middle of the pixel by default.
      // When we want to draw pixel perfect lines, we will need to
      // account for that here
      if (x === 0) {
        this.canvasCtx.moveTo(x, y);
      } else {
        this.canvasCtx.lineTo(x, y);
      }
    }
    this.canvasCtx.stroke();
  }

  _printBar(x, height, peakHeight) {
    height = Math.ceil(height) * PIXEL_DENSITY;
    peakHeight = Math.ceil(peakHeight) * PIXEL_DENSITY;
    if (height > 0 || peakHeight > 0) {
      const y = this._height() - height;
      const ctx = this.canvasCtx;
      // Draw the gradient
      const b = BAR_WIDTH;
      if (height > 0) {
        ctx.drawImage(this.barCanvas, 0, y, b, height, x, y, b, height);
      }

      // Draw the gray peak line
      if (!this.props.windowShade) {
        const peakY = this._height() - peakHeight;
        ctx.fillStyle = this.props.colors[PEAK_COLOR_INDEX];
        ctx.fillRect(x, peakY, b, PIXEL_DENSITY);
      }
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

      this._printBar(
        j * xOffset,
        amplitude * heightMultiplier,
        barPeak * heightMultiplier
      );
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
