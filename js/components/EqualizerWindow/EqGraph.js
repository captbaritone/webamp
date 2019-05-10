import React from "react";
import { connect } from "react-redux";
import { percentToRange, clamp } from "../../utils";
import { BANDS } from "../../constants";
import spline from "./spline";
import * as Selectros from "../../selectors";

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

    this.createColorPattern(this.props.lineColorsImagePromise);
    this.createPreampLineImage(this.props.preampLineImagePromise);
  }

  componentDidUpdate() {
    this.canvasCtx.clearRect(0, 0, this.width, this.height);
    this.drawPreampLine();
    this.drawEqLine(); // This should paint on top of the preamp line
  }

  shouldComponentUpdate(nextProps) {
    if (
      this.props.lineColorsImagePromise !== nextProps.lineColorsImagePromise
    ) {
      this.createColorPattern(nextProps.lineColorsImagePromise);
    }
    if (
      this.props.preampLineImagePromise !== nextProps.preampLineImagePromise
    ) {
      this.createPreampLineImage(nextProps.preampLineImagePromise);
    }
    return true;
  }

  async createPreampLineImage(preampLineImagePromise) {
    const preampLineImg = await preampLineImagePromise;
    this.setState({ preampLineImg });
  }

  async createColorPattern(lineColorsImagePromise) {
    this.setState({
      colorPattern: this.canvasCtx.createPattern(
        await lineColorsImagePromise,
        "repeat-x"
      ),
    });
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
  // WebampLazy.skinIsLoaded() makes an effort to ensure that these promises are
  // already resolved before our initial render. This means our setStates
  // should get called on a microtask and we should rerender with this loaded
  // before we paint.
  // This does not work when loading skins after initial render.
  lineColorsImagePromise: Selectros.getLineColorsImage(state),
  preampLineImagePromise: Selectros.getPreampLineImage(state),
}))(EqGraph);
