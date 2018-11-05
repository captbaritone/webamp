import React from "react";
import { connect } from "react-redux";
import { percentToRange, clamp } from "../../utils";
import { BANDS } from "../../constants";
import spline from "./spline";

const GRAPH_HEIGHT = 19;
const GRAPH_WIDTH = 113;

class EqGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.canvasCtx = this.canvas.getContext("2d");
    this.width = Number(this.canvas.width);
    this.height = Number(this.canvas.height);

    if (this.props.lineColorsImage) {
      this.createColorPattern(this.props.lineColorsImage);
    }
    if (this.props.preampLineUrl) {
      this.createPreampLineImage(this.props.preampLineUrl);
    }
  }

  componentDidUpdate() {
    this.canvasCtx.clearRect(0, 0, this.width, this.height);
    this.drawPreampLine();
    this.drawEqLine(); // This should paint on top of the preamp line
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.lineColorsImage !== nextProps.lineColorsImage) {
      this.createColorPattern(nextProps.lineColorsImage);
    }
    if (this.props.preampLineUrl !== nextProps.preampLineUrl) {
      this.createPreampLineImage(nextProps.preampLineUrl);
    }
    return true;
  }

  createPreampLineImage(preampLineUrl) {
    const preampLineImg = new Image();
    preampLineImg.onload = () => {
      this.setState({ preampLineImg });
    };
    preampLineImg.src = preampLineUrl;
  }

  createColorPattern(lineColorsImage) {
    const bgImage = new Image();
    bgImage.onload = () => {
      const { width, height } = bgImage;
      const colorsCanvas = document.createElement("canvas");
      const colorsCtx = colorsCanvas.getContext("2d");
      colorsCanvas.width = width;
      colorsCanvas.height = height;
      colorsCtx.drawImage(bgImage, 0, 0, width, height);
      this.setState({
        colorPattern: this.canvasCtx.createPattern(colorsCanvas, "repeat-x")
      });
    };
    bgImage.src = lineColorsImage;
  }

  drawEqLine() {
    if (!this.state.colorPattern) {
      // The skin has not finished loading yet
      return;
    }
    const { props } = this;
    const amplitudes = BANDS.map(band => props[band]);

    this.canvasCtx.fillStyle = this.state.colorPattern;
    const paddingLeft = 2; // TODO: This should be 1.5

    const min = 0;
    const max = GRAPH_HEIGHT - 1;

    const xs = [];
    const ys = [];
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
      this.canvasCtx.fillRect(paddingLeft + x, yTop, 1, height);
      lastY = y;
    }
  }

  drawPreampLine() {
    const { preampLineImg } = this.state;
    if (!preampLineImg) {
      // The skin has not finished loading yet
      return;
    }
    const preampValue = percentToRange(
      this.props.preamp / 100,
      0,
      GRAPH_HEIGHT - 1
    );
    this.canvasCtx.drawImage(
      this.state.preampLineImg,
      0,
      preampValue,
      preampLineImg.width,
      preampLineImg.height
    );
  }

  render() {
    return (
      <canvas
        id="eqGraph"
        ref={node => (this.canvas = node)}
        width={GRAPH_WIDTH}
        height={GRAPH_HEIGHT}
      />
    );
  }
}

export default connect(state => ({
  ...state.equalizer.sliders,
  lineColorsImage: state.display.skinImages.EQ_GRAPH_LINE_COLORS,
  preampLineUrl: state.display.skinImages.EQ_PREAMP_LINE
}))(EqGraph);
