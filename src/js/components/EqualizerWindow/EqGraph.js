import React from "react";
import { connect } from "react-redux";
import { getCurvePoints } from "cardinal-spline-js";
import { percentToRange, clamp } from "../../utils";

import { BANDS } from "../../constants";

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
    const paddingLeft = 4; // TODO: This should be 3

    const min = 1;
    const max = 31;

    const points = amplitudes.reduce((prev, value, i) => {
      const percent = (100 - value) / 100;
      const y = percentToRange(percent, min, max);
      return prev.concat(paddingLeft + i * 16, y);
    }, []);

    // Spline between points in order to create nice curves
    const tension = 0.5;
    const resolution = 4; // Points in each segment
    const smoothPoints = getCurvePoints(points, tension, resolution);
    for (let i = 0; i < smoothPoints.length; i += 2) {
      // Splining can push peaks out of bounds. So we fudge them back in.
      const y = clamp(smoothPoints[i + 1], min, max);
      this.canvasCtx.lineTo(smoothPoints[i], y);
    }

    this.canvasCtx.stroke();
  }

  drawPreampLine() {
    const { preampLineImg } = this.state;
    if (!preampLineImg) {
      // The skin has not finished loading yet
      return;
    }
    const preampValue = percentToRange(this.props.preamp / 100, 0, 30);
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
        ref={node => (this.canvas = node)}
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
