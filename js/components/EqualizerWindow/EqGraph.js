import React from "react";
import { connect } from "react-redux";
import { getCurvePoints } from "./spline";
import line from "./bresenham";
import { percentToRange, clamp } from "../../utils";

import { BANDS } from "../../constants";

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

    const points = amplitudes.reduce((prev, value, i) => {
      const percent = (100 - value) / 100;
      const y = percentToRange(percent, min, max);
      const x = i * 12; // Each band is 12 pixels wide
      return prev.concat(x, y);
    }, []);

    // Spline between points in order to create nice curves
    const tension = 0.8;
    const resolution = 4; // Points in each segment
    const smoothPoints = getCurvePoints(points, tension, resolution);
    const smoothPointCoords = [];
    for (let i = 0; i < smoothPoints.length; i += 2) {
      // Splining can push peaks out of bounds. So we fudge them back in.
      const x = Math.round(smoothPoints[i]);
      const y = Math.round(clamp(smoothPoints[i + 1], min, max));
      smoothPointCoords.push({ x, y });
    }

    let prev = smoothPointCoords.shift();

    smoothPointCoords.forEach(next => {
      for (const point of line(prev, next)) {
        // Note: Technially, we are double drawing each point given to us by
        // getCurvePoints, since the end of each line is the same as the start
        // of the next.
        this.canvasCtx.fillRect(paddingLeft + point.x, point.y, 1, 1);
      }
      prev = next;
    });
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
