import React from "react";
import { connect } from "react-redux";
import { getCurvePoints } from "cardinal-spline-js";

import { BANDS } from "../constants";

export const roundToEven = value => 2 * Math.round(value / 2);

export const getY = value => roundToEven(32 - value / 100 * 32);

class EqGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.canvasCtx = this.canvas.getContext("2d");
    this.canvasCtx.imageSmoothingEnabled = false;
    this.width = this.canvas.width * 1; // Cast to int
    this.height = this.canvas.height * 1; // Cast to int
  }

  componentDidUpdate() {
    this.canvasCtx.clearRect(0, 0, this.width, this.height);
    //this.createColorPattern();
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
      const colorsCanvas = document.createElement("canvas");
      const colorsCtx = colorsCanvas.getContext("2d");
      colorsCanvas.width = bgImage.width * 2;
      colorsCanvas.height = bgImage.height * 2;
      colorsCtx.drawImage(
        bgImage,
        0,
        0,
        colorsCanvas.width,
        colorsCanvas.height
      );
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

    this.canvasCtx.strokeStyle = this.state.colorPattern;
    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.beginPath();
    const paddingLeft = 4;

    const points = amplitudes.reduce(
      (prev, value, i) => prev.concat(paddingLeft + i * 16, getY(value)),
      []
    );

    // Spline between points in order to create nice curves
    const tension = 0.5;
    const resolution = 4; // Points in each segment
    const smoothPoints = getCurvePoints(points, tension, resolution);
    for (let i = 0; i < smoothPoints.length; i += 2) {
      this.canvasCtx.lineTo(smoothPoints[i], smoothPoints[i + 1]);
    }

    this.canvasCtx.stroke();
  }

  drawPreampLine() {
    const { preampLineImg } = this.state;
    if (!preampLineImg) {
      // The skin has not finished loading yet
      return;
    }
    const preampValue = getY(100 - this.props.preamp);
    this.canvasCtx.drawImage(
      this.state.preampLineImg,
      0,
      preampValue,
      preampLineImg.width * 2,
      preampLineImg.height * 2
    );
  }

  render() {
    return (
      <canvas
        id="eqGraph"
        ref={node => this.canvas = node}
        width="152"
        height="32"
      />
    );
  }
}

export default connect(state => ({
  ...state.equalizer.sliders,
  lineColorsImage: state.display.skinImages.EQ_GRAPH_LINE_COLORS,
  preampLineUrl: state.display.skinImages.EQ_PREAMP_LINE
}))(EqGraph);
