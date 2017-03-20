import React from "react";
import { connect } from "react-redux";
import { getTimeObj } from "../utils";

import { TOGGLE_TIME_MODE } from "../actionTypes";

const Time = ({ timeElapsed, length, timeMode, toggleTimeMode }) => {
  const seconds = timeMode === "ELAPSED" ? timeElapsed : length - timeElapsed;

  const timeObj = getTimeObj(seconds);
  return (
    <div id="time" onClick={toggleTimeMode} className="countdown">
      {timeMode === "REMAINING" && <div id="minus-sign" />}
      <div
        id="minute-first-digit"
        className={`digit digit-${timeObj.minutesFirstDigit}`}
      />
      <div
        id="minute-second-digit"
        className={`digit digit-${timeObj.minutesSecondDigit}`}
      />
      <div
        id="second-first-digit"
        className={`digit digit-${timeObj.secondsFirstDigit}`}
      />
      <div
        id="second-second-digit"
        className={`digit digit-${timeObj.secondsSecondDigit}`}
      />
    </div>
  );
};

const mapStateToProps = state => state.media;
const mapDispatchToProps = dispatch => ({
  toggleTimeMode: () => dispatch({ type: TOGGLE_TIME_MODE })
});

export default connect(mapStateToProps, mapDispatchToProps)(Time);
