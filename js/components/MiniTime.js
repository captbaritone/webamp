import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { getTimeObj } from "../utils";
import Character from "./Character";

import { TOGGLE_TIME_MODE } from "../actionTypes";

import "../../css/mini-time.css";

const MiniTime = props => {
  if (props.status === "STOPPED") {
    return null;
  }
  const seconds =
    props.timeMode === "ELAPSED"
      ? props.timeElapsed
      : props.length - props.timeElapsed;

  const timeObj = getTimeObj(seconds);
  return (
    <div
      onClick={props.toggle}
      className={classnames("mini-time", "countdown", {
        blinking: props.status === "PAUSED"
      })}
    >
      <Character style={{ left: 0 }}>
        {props.timeMode === "REMAINING" ? "-" : ""}
      </Character>
      <Character style={{ left: 6 }}>{timeObj.minutesFirstDigit}</Character>
      <Character style={{ left: 11 }}>{timeObj.minutesSecondDigit}</Character>
      <Character style={{ left: 20 }}>{timeObj.secondsFirstDigit}</Character>
      <Character style={{ left: 25 }}>{timeObj.secondsSecondDigit}</Character>
    </div>
  );
};

const mapDispatchToProps = {
  toggle: () => ({ type: TOGGLE_TIME_MODE })
};

export default connect(state => state.media, mapDispatchToProps)(MiniTime);
