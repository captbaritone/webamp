// Single line text display that can animate and hold multiple registers
import React from "react";
import { connect } from "react-redux";
import { getTimeStr } from "../utils";

import { STEP_MARQUEE } from "../actionTypes";

const getBalanceText = balance => {
  if (balance === 0) {
    return "Balance: Center";
  }
  const direction = balance > 0 ? "Right" : "Left";
  return `Balance: ${Math.abs(balance)}% ${direction}`;
};

const getVolumeText = volume => `Volume: ${volume}%`;

const getPositionText = (duration, seekToPercent) => {
  const newElapsedStr = getTimeStr(duration * seekToPercent / 100);
  const durationStr = getTimeStr(duration);
  return `Seek to: ${newElapsedStr}/${durationStr} (${seekToPercent}%)`;
};

const getMediaText = (name, duration) =>
  `${name} (${getTimeStr(duration)})  ***  `;

const getDoubleSizeModeText = enabled =>
  `${enabled ? "Disable" : "Enable"} doublesize mode`;

const isLong = text => text.length > 30;

// Given text and step, how many pixels should it be shifted?
const stepOffset = (text, step) => {
  if (!isLong(text)) {
    return 0;
  }
  return step % text.length * 5;
};

// Format an int as negative pixels
const negativePixels = pixels => `-${pixels}px`;

// If text is wider than the marquee, it needs to loop
const loopText = text => (isLong(text) ? text + text : text);

import CharacterString from "./CharacterString";

class Marquee extends React.Component {
  constructor(props) {
    super(props);
    this.state = { stepping: true };
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.getText = this.getText.bind(this);
  }

  componentDidMount() {
    const step = () => {
      setTimeout(() => {
        if (this.state.stepping) {
          this.props.dispatch({ type: STEP_MARQUEE });
        }
        step();
      }, 220);
    };
    step();
  }

  getText() {
    switch (this.props.userInput.focus) {
      case "balance":
        return getBalanceText(this.props.media.balance);
      case "volume":
        return getVolumeText(this.props.media.volume);
      case "position":
        return getPositionText(
          this.props.media.length,
          this.props.userInput.scrubPosition
        );
      case "double":
        return getDoubleSizeModeText(this.props.display.doubled);
      default:
        break;
    }
    if (this.props.media.name) {
      return getMediaText(this.props.media.name, this.props.media.length);
    }
    return "Winamp 2.91";
  }

  handleMouseDown() {
    this.setState({ stepping: false });
    document.addEventListener("mouseup", () => {
      // TODO: Remove this listener
      setTimeout(() => {
        this.setState({ stepping: true });
      }, 1000);
    });
  }

  render() {
    const text = this.getText();
    const offset = stepOffset(text, this.props.display.marqueeStep);
    return (
      <div id="marquee" className="text" onMouseDown={this.handleMouseDown}>
        <CharacterString style={{ marginLeft: negativePixels(offset) }}>
          {loopText(text)}
        </CharacterString>
      </div>
    );
  }
}

export {
  getBalanceText,
  getVolumeText,
  getPositionText,
  getMediaText,
  getDoubleSizeModeText,
  negativePixels,
  stepOffset,
  loopText,
  Marquee
};
export default connect(state => state)(Marquee);
