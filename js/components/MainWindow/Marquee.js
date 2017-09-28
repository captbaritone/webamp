// Single line text display that can animate and hold multiple registers
// Knows how to display various modes like tracking, volume, balance, etc.
import React from "react";
import { connect } from "react-redux";
import { getTimeStr } from "../../utils";

import { STEP_MARQUEE } from "../../actionTypes";
import CharacterString from "../CharacterString";
import { noMarquee } from "../../config";

const CHAR_WIDTH = 5;

// Always positive modulus
export const mod = (n, m) => (n % m + m) % m;

export const getBalanceText = balance => {
  if (balance === 0) {
    return "Balance: Center";
  }
  const direction = balance > 0 ? "Right" : "Left";
  return `Balance: ${Math.abs(balance)}% ${direction}`;
};

export const getVolumeText = volume => `Volume: ${volume}%`;

export const getPositionText = (duration, seekToPercent) => {
  const newElapsedStr = getTimeStr(duration * seekToPercent / 100);
  const durationStr = getTimeStr(duration);
  return `Seek to: ${newElapsedStr}/${durationStr} (${seekToPercent}%)`;
};

export const getMediaText = (name, duration) =>
  `${name} (${getTimeStr(duration)})  ***  `;

export const getDoubleSizeModeText = enabled =>
  `${enabled ? "Disable" : "Enable"} doublesize mode`;

const formatHz = hz => (hz < 1000 ? `${hz}HZ` : `${hz / 1000}KHZ`);

// Format a number as a string, ensuring it has a + or - sign
const ensureSign = num => (num > 0 ? `+${num}` : num.toString());

// Round to 1 and exactly 1 decimal point
const roundToTenths = num => (Math.round(num * 10) / 10).toFixed(1);

export const getEqText = (band, level) => {
  const db = roundToTenths((level - 50) / 50 * 12);
  const label = band === "preamp" ? "Preamp" : formatHz(band);
  return `EQ: ${label} ${ensureSign(db)} DB`;
};

const isLong = text => text.length > 30;

// Given text and step, how many pixels should it be shifted?
export const stepOffset = (text, step, pixels) => {
  if (!isLong(text)) {
    return 0;
  }

  const stepOffsetWidth = step * CHAR_WIDTH; // Steps move one char at a time
  const offset = stepOffsetWidth + pixels;
  const stringLength = text.length * CHAR_WIDTH;

  return mod(offset, stringLength);
};

// Format an int as pixels
export const pixelUnits = pixels => `${pixels}px`;

// If text is wider than the marquee, it needs to loop
export const loopText = text => (isLong(text) ? text + text : text);

class Marquee extends React.Component {
  constructor(props) {
    super(props);
    this.state = { stepping: true, dragOffset: 0 };
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.getText = this.getText.bind(this);
    this.stepHandle = null;
  }

  componentDidMount() {
    const step = () => {
      this.stepHandle = setTimeout(() => {
        if (this.state.stepping) {
          this.props.dispatch({ type: STEP_MARQUEE });
        }
        step();
      }, 220);
    };
    if (!noMarquee) {
      step();
    }
  }

  componentWillUnmount() {
    if (this.stepHandle) {
      clearTimeout(this.stepHandle);
    }
  }

  getText() {
    if (this.props.userInput.userMessage != null) {
      return this.props.userInput.userMessage;
    }
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
      case "eq":
        const band = this.props.userInput.bandFocused;
        return getEqText(band, this.props.equalizer.sliders[band]);
      default:
        break;
    }
    if (this.props.media.name) {
      return getMediaText(this.props.media.name, this.props.media.length);
    }
    return "Winamp 2.91";
  }

  handleMouseDown(e) {
    const xStart = e.clientX;
    this.setState({ stepping: false });
    const handleMouseMove = ee => {
      const diff = ee.clientX - xStart;
      this.setState({ dragOffset: -diff });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      // TODO: Remove this listener
      setTimeout(() => {
        this.setState({ stepping: true });
      }, 1000);
      document.removeEventListener("mouseUp", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  render() {
    const text = this.getText();
    const offset = stepOffset(
      text,
      this.props.display.marqueeStep,
      this.state.dragOffset
    );
    const marginLeft = pixelUnits(-offset);
    return (
      <div
        id="marquee"
        className="text"
        onMouseDown={this.handleMouseDown}
        title="Song Title"
      >
        <CharacterString style={{ marginLeft }}>
          {loopText(text)}
        </CharacterString>
      </div>
    );
  }
}

// TODO: Define map state to props
export default connect(state => state)(Marquee);
