import React from "react";
import * as Utils from "./utils";
import { SCREENSHOT_HEIGHT, SCREENSHOT_WIDTH } from "./constants";

export default class FocusedSkin extends React.Component {
  constructor(props) {
    super(props);
    // TODO: Handle the case were we come from a permalink
    this.state = {
      top: this.props.initialTop,
      left: this.props.initialLeft,
      width: this.props.initialWidth,
      height: this.props.initialHeight
    };
  }
  componentDidMount() {
    setTimeout(() => {
      // TODO: Observe DOM and recenter
      const { windowWidth, windowHeight } = Utils.getWindowSize();
      this.setState({
        top: (windowHeight - SCREENSHOT_HEIGHT) / 2,
        left: (windowWidth - SCREENSHOT_WIDTH) / 2,
        height: SCREENSHOT_HEIGHT,
        width: SCREENSHOT_WIDTH
      });
    }, 0);
  }
  render() {
    return (
      <div
        id="focused-skin"
        style={{
          position: "fixed",
          height: this.state.height,
          width: this.state.width,
          transform: `translateX(${this.state.left}px) translateY(${
            this.state.top
          }px)`,
          transition:
            "transform 400ms ease-out, height 400ms ease-out, width 400ms ease-out"
        }}
      >
        <img
          style={{
            width: "100%",
            height: "100%"
          }}
          src={Utils.screenshotUrlFromHash(this.props.hash)}
        />
      </div>
    );
  }
}
