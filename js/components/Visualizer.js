import React from "react";
import { connect } from "react-redux";

import { toggleVisualizerStyle } from "../actionCreators";
import { getWindowShade, getVisualizerStyle } from "../selectors";
import { VISUALIZERS } from "../constants";

const PIXEL_DENSITY = 2;
const NUM_BARS = 20;
const BAR_PEAK_DROP_RATE = 0.01;
const GRADIENT_COLOR_COUNT = 16;
const PEAK_COLOR_INDEX = 23;

// Return the average value in a slice of dataArray
function sliceAverage(dataArray, sliceWidth, sliceNumber) {
  const start = sliceWidth * sliceNumber;
  const end = start + sliceWidth;
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += dataArray[i];
  }
  return sum / sliceWidth;
}

class Visualizer extends React.Component {
  componentDidMount() {
    this.barPeaks = new Array(NUM_BARS).fill(0);
    this.barPeakFrames = new Array(NUM_BARS).fill(0);
    this.canvasCtx = this.canvas.getContext("2d");
    this.canvasCtx.imageSmoothingEnabled = false;

    this.setStyle();

    // Kick off the animation loop
    const loop = () => {
      if (this.props.status === "PLAYING") {
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

  _barWidth() {
    const barWidth = Math.floor(this._width() / NUM_BARS);
    if (barWidth % 2 === 0) {
      return barWidth;
    }

    return barWidth - 1;
  }

  _generateOctaveBuckets() {
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
      const octaveIdx = Math.floor(
        (octaveBuckets[i] / maxHz) * this.bufferLength
      );
      octaveBuckets[i] = octaveIdx;
    }

    return octaveBuckets;
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
        this.octaveBuckets = this._generateOctaveBuckets();
      }
    }
  }

  clear() {
    this.canvasCtx.drawImage(this.bgCanvas, 0, 0);
  }

  // Pre-render the background grid
  preRenderBg() {
    // Off-screen canvas for pre-rendering the background
    this.bgCanvas = document.createElement("canvas");
    this.bgCanvas.width = this._width();
    this.bgCanvas.height = this._height();

    const bgCanvasCtx = this.bgCanvas.getContext("2d");
    bgCanvasCtx.fillStyle = this.props.colors[0];
    bgCanvasCtx.fillRect(0, 0, this._width(), this._height());
    if (this.props.spekles) {
      bgCanvasCtx.fillStyle = this.props.colors[1];
      for (let x = 0; x < this._width(); x += 4) {
        for (let y = PIXEL_DENSITY; y < this._height(); y += 4) {
          bgCanvasCtx.fillRect(x, y, PIXEL_DENSITY, PIXEL_DENSITY);
        }
      }
    }
  }

  // Pre-render the bar gradient
  preRenderBar() {
    /**
     * The order of the colours is commented in the file: the fist two colours
     * define the background and dots (check it to see what are the dots), the
     * next 16 colours are the analyzer's colours from top to bottom, the next
     * 5 colours are the oscilloscope's ones, from center to top/bottom, the
     * last colour is for the analyzer's peak markers.
     */

    // Off-screen canvas for pre-rendering a single bar gradient
    const barWidth = this._barWidth();
    this.barCanvas = document.createElement("canvas");
    this.barCanvas.width = barWidth;
    this.barCanvas.height = this._height();

    const offset = 2; // The first two colors are for the background;
    const gradientColors = this.props.colors.slice(
      offset,
      offset + GRADIENT_COLOR_COUNT
    );

    const barCanvasCtx = this.barCanvas.getContext("2d");
    const height = this._renderHeight();
    const multiplier = GRADIENT_COLOR_COUNT / height;
    // In shade mode, the five colors are, from top to bottom:
    // 214, 102, 0 -- 3
    // 222, 165, 24 -- 6
    // 148, 222, 33 -- 9
    // 57, 181, 16 -- 12
    // 24, 132, 8 -- 15
    // TODO: This could probably be improved by iterating backwards
    for (let i = 0; i < height; i++) {
      const colorIndex = GRADIENT_COLOR_COUNT - 1 - Math.floor(i * multiplier);
      barCanvasCtx.fillStyle = gradientColors[colorIndex];
      const y = this._height() - i * PIXEL_DENSITY;
      barCanvasCtx.fillRect(0, y, barWidth, PIXEL_DENSITY);
    }
  }

  paintFrame() {
    this.clear();
    if (this.props.style === VISUALIZERS.OSCILLOSCOPE) {
      this._paintOscilloscopeFrame();
    } else if (this.props.style === VISUALIZERS.BAR) {
      this._paintBarFrame();
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
      const percentAmplitude = (amplitude - 128) / 128; // dataArray gives us bytes
      const y = percentAmplitude * h + h / 2; // center wave at half height
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
      const b = this._barWidth();
      if (height > 0) {
        ctx.drawImage(this.barCanvas, 0, y, b, height, x, y, b, height);
      }

      // Draw the gray peak line
      const peakY = this._height() - peakHeight;
      ctx.fillStyle = this.props.colors[PEAK_COLOR_INDEX];
      ctx.fillRect(x, peakY, b, PIXEL_DENSITY);
    }
  }

  _paintBarFrame() {
    this.props.analyser.getByteFrequencyData(this.dataArray);
    const heightMultiplier = this._renderHeight() / 256;
    const barWidth = this._barWidth();
    const xOffset = barWidth + PIXEL_DENSITY; // Bar width, plus a pixel of spacing to the right.
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
  width: getWindowShade(state, "main") ? 38 : 76,
  height: getWindowShade(state, "main") ? 5 : 16,
  status: state.media.status,
  spekles: !getWindowShade(state, "main"),
  dummyVizData: state.display.dummyVizData
});

const mapDispatchToProps = {
  toggleVisualizerStyle
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Visualizer);
