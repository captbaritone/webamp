import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { getTimeObj } from "../utils";
import { TOGGLE_TIME_MODE } from "../actionTypes";
import Character from "./Character";

import "../../css/mini-time.css";

// Sigh. When he display is blinking (say when it's paused) we need to
// alternate between the actual caracter and the space character. Not
// Possible to that in purce CSS with the background being dynamically generated.
// All "space" characters is also how Winamp renders no content.
const Background = () =>
  [1, 7, 12, 20, 25].map((left, i) => (
    <Character
      style={{ left }}
      key={i}
      className="background-character"
      children=" "
    />
  ));

const MiniTime = props => {
  let seconds = null;
  // TODO: Clean this up: If stopped, just render the background, rather than
  // rendering spaces twice.
  if (props.status !== "STOPPED") {
    seconds =
      props.timeMode === "ELAPSED"
        ? props.timeElapsed
        : props.length - props.timeElapsed;
  }

  const timeObj = getTimeObj(seconds);
  const showMinus =
    props.timeMode === "REMAINING" && props.status !== "STOPPED";
  return (
    <div
      onClick={props.toggle}
      className={classnames("mini-time", "countdown", {
        blinking: props.status === "PAUSED"
      })}
    >
      <Background />
      <Character style={{ left: 1 }}>{showMinus ? "-" : " "}</Character>
      <Character style={{ left: 7 }}>{timeObj.minutesFirstDigit}</Character>
      <Character style={{ left: 12 }}>{timeObj.minutesSecondDigit}</Character>
      <Character style={{ left: 20 }}>{timeObj.secondsFirstDigit}</Character>
      <Character style={{ left: 25 }}>{timeObj.secondsSecondDigit}</Character>
    </div>
  );
};

const mapDispatchToProps = {
  toggle: () => ({ type: TOGGLE_TIME_MODE })
};

export default connect(state => state.media, mapDispatchToProps)(MiniTime);
