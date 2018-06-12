import React from "react";
import { connect } from "react-redux";

import { toggleVisualizerStyle } from "../actionCreators";
import { getWindowShade, getVisualizerStyle } from "../selectors";
import { VISUALIZERS } from "../constants";

const PIXEL_DENSITY = 2;
const BAR_WIDTH = 6;
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
    this.canvasCtx = this.canvas.getContext("2d");
    this.canvasCtx.imageSmoothingEnabled = false;

    this.setStyle();

    // Kick off the animation loop
    const loop = () => {
      if (this.props.status === "PLAYING") {
        this.paintFrame();
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
    if (this.props.style === VISUALIZERS.OSCILLOSCOPE) {
      this.props.analyser.fftSize = 2048;
      this.bufferLength = this.props.analyser.fftSize;
      this.dataArray = new Uint8Array(this.bufferLength);
    } else if (this.props.style === VISUALIZERS.BAR) {
      this.props.analyser.fftSize = 64; // Must be a power of two
      // Number of bins/bars we get
      this.bufferLength = this.props.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
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
    this.barCanvas = document.createElement("canvas");
    this.barCanvas.width = BAR_WIDTH;
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
      barCanvasCtx.fillRect(0, y, BAR_WIDTH, PIXEL_DENSITY);
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

    // The max amplitude is half the height
    const h = this._height() / 2;

    this.canvasCtx.beginPath();

    // Iterate over the width of the canvas in "real" pixels.
    for (let j = 0; j <= this._renderWidth(); j++) {
      const amplitude = sliceAverage(this.dataArray, sliceWidth, j);
      const percentAmplitude = amplitude / 128; // dataArray gives us bytes
      const y = percentAmplitude * h;
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

  _printBar(x, height) {
    height = Math.ceil(height) * PIXEL_DENSITY;
    if (height > 0) {
      const y = this._height() - height;
      const ctx = this.canvasCtx;
      // Draw the gradient
      const b = BAR_WIDTH;
      ctx.drawImage(this.barCanvas, 0, y, b, height, x, y, b, height);

      // Draw the gray peak line
      // TODO: Rather than sitting on top of the bar, these
      // are expected to be behind the top pixel, and fall more slowly.
      // Currently these overwrite the top pixel.
      ctx.fillStyle = this.props.colors[PEAK_COLOR_INDEX];
      ctx.fillRect(x, y, BAR_WIDTH, PIXEL_DENSITY);
    }
  }

  _paintBarFrame() {
    this.props.analyser.getByteFrequencyData(this.dataArray);
    // We are printing bars off the right of the canvas :(
    const xOffset = BAR_WIDTH + PIXEL_DENSITY; // Bar width, plus a pixel of spacing to the right.
    const heightMultiplier = this._renderHeight() / 256;
    for (let j = 0; j < this.bufferLength; j++) {
      this._printBar(j * xOffset, this.dataArray[j] * heightMultiplier);
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
  spekles: !getWindowShade(state, "main")
});

const mapDispatchToProps = {
  toggleVisualizerStyle
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Visualizer);
