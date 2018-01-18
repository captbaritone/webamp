import React from "react";
import { connect } from "react-redux";

import { toggleVisualizerStyle } from "../../actionCreators";

const OSCILLOSCOPE = 1;
const BAR = 2;

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
    this.width = Number(this.canvas.width);
    this.height = Number(this.canvas.height);

    // Off-screen canvas for pre-rendering the background
    this.bgCanvas = document.createElement("canvas");
    this.bgCanvas.width = this.width;
    this.bgCanvas.height = this.height;

    // Off-screen canvas for pre-rendering a single bar gradient
    this.barCanvas = document.createElement("canvas");
    this.barCanvas.width = 6;
    this.barCanvas.height = 32;

    this.setStyle();

    // Kick off the animation loop
    const loop = () => {
      if (this.props.status === "PLAYING") {
        this.paintFrame();
      }
      window.requestAnimationFrame(loop);
    };
    loop();
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
    this.preRenderBg();
    this.preRenderBar();
    if (this.props.style === OSCILLOSCOPE) {
      this.props.analyser.fftSize = 2048;
      this.bufferLength = this.props.analyser.fftSize;
      this.dataArray = new Uint8Array(this.bufferLength);
    } else if (this.props.style === BAR) {
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
    const bgCanvasCtx = this.bgCanvas.getContext("2d");
    bgCanvasCtx.fillStyle = this.props.colors[0];
    bgCanvasCtx.fillRect(0, 0, this.width, this.height);
    bgCanvasCtx.fillStyle = this.props.colors[1];
    for (let x = 0; x < this.width; x += 4) {
      for (let y = 2; y < this.height; y += 4) {
        bgCanvasCtx.fillRect(x, y, 2, 2);
      }
    }
  }

  // Pre-render the bar gradient
  preRenderBar() {
    const barCanvasCtx = this.barCanvas.getContext("2d");
    barCanvasCtx.fillStyle = this.props.colors[23];
    barCanvasCtx.fillRect(0, 0, 6, 2);
    for (let i = 0; i <= 15; i++) {
      const colorNumber = 17 - i;
      barCanvasCtx.fillStyle = this.props.colors[colorNumber];
      const y = 32 - i * 2;
      barCanvasCtx.fillRect(0, y, 6, 2);
    }
  }

  paintFrame() {
    this.clear();
    if (this.props.style === OSCILLOSCOPE) {
      this._paintOscilloscopeFrame();
    } else if (this.props.style === BAR) {
      this._paintBarFrame();
    }
  }

  _paintOscilloscopeFrame() {
    this.props.analyser.getByteTimeDomainData(this.dataArray);

    // 2 because we're shrinking the canvas by 2
    this.canvasCtx.lineWidth = 2;

    // Just use one of the viscolors for now
    this.canvasCtx.strokeStyle = this.props.colors[18];

    // Since dataArray has more values than we have pixels to display, we
    // have to average several dataArray values per pixel. We call these
    // groups slices.
    //
    // We use the  2x scale here since we only want to plot values for
    // "real" pixels.
    const sliceWidth = Math.floor(this.bufferLength / this.width) * 2;

    // The max amplitude is half the height
    const h = this.height / 2;

    this.canvasCtx.beginPath();

    // Iterate over the width of the canvas in "real" pixels.
    for (let j = 0; j <= this.width / 2; j++) {
      const amplitude = sliceAverage(this.dataArray, sliceWidth, j);
      const percentAmplitude = amplitude / 128; // dataArray gives us bytes
      const y = percentAmplitude * h;
      const x = j * 2;

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
    height = Math.round(height) * 2;
    if (height > 0) {
      const y = 32 - height;
      const ctx = this.canvasCtx;
      // Draw the gray peak line
      ctx.drawImage(this.barCanvas, 0, 0, 6, 2, x, y - 2, 6, 2);
      // Draw the gradient
      ctx.drawImage(this.barCanvas, 0, y, 6, height, x, y, 6, height);
    }
  }

  _paintBarFrame() {
    this.props.analyser.getByteFrequencyData(this.dataArray);
    // We are printing bars off the right of the canvas :(
    for (let j = 0; j < this.bufferLength; j++) {
      const height = this.dataArray[j] * (14 / 256);
      this._printBar(j * 8, height);
    }
  }

  render() {
    return (
      <canvas
        id="visualizer"
        ref={node => (this.canvas = node)}
        width="152"
        height="32"
        onClick={this.props.toggleVisualizerStyle}
      />
    );
  }
}

const mapStateToProps = state => ({
  colors: state.display.skinColors,
  style: state.display.visualizerStyle,
  status: state.media.status
});

const mapDispatchToProps = {
  toggleVisualizerStyle
};

export default connect(mapStateToProps, mapDispatchToProps)(Visualizer);
