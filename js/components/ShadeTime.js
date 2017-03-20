import React from "react";
import { connect } from "react-redux";
import { getTimeObj } from "../utils";
import Character from "./Character";

import { TOGGLE_TIME_MODE } from "../actionTypes";

class Time extends React.Component {
  constructor(props) {
    super(props);
    this.toggleTimeMode = this.toggleTimeMode.bind(this);
  }
  toggleTimeMode() {
    this.props.dispatch({ type: TOGGLE_TIME_MODE });
  }
  render() {
    const seconds = this.props.timeMode === "ELAPSED"
      ? this.props.timeElapsed
      : this.props.length - this.props.timeElapsed;

    const timeObj = getTimeObj(seconds);
    return (
      <div id="shade-time" onClick={this.toggleTimeMode} className="countdown">
        <Character id="shade-minus-sign">
          {this.props.timeMode === "REMAINING" ? "-" : ""}
        </Character>
        <Character id="shade-minute-first-digit">
          {timeObj.minutesFirstDigit}
        </Character>
        <Character id="shade-minute-second-digit">
          {timeObj.minutesSecondDigit}
        </Character>
        <Character id="shade-second-first-digit">
          {timeObj.secondsFirstDigit}
        </Character>
        <Character id="shade-second-second-digit">
          {timeObj.secondsSecondDigit}
        </Character>
      </div>
    );
  }
}

export default connect(state => state.media)(Time);
