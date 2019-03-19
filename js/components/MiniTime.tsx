import { AppState, Dispatch } from "../types";
import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { getTimeObj } from "../utils";
import { TOGGLE_TIME_MODE } from "../actionTypes";
import { TIME_MODE, MEDIA_STATUS } from "../constants";
import Character from "./Character";
import * as Selectors from "../selectors";

import "../../css/mini-time.css";

// Sigh. When the display is blinking (say when it's paused) we need to
// alternate between the actual character and the space character. Not
// Possible to do that in pure CSS with the background being dynamically generated.
// All "space" characters is also how Winamp renders no content.
const Background = () => (
  <React.Fragment>
    {[1, 7, 12, 20, 25].map((left, i) => (
      <Character
        style={{ left }}
        key={i}
        className="background-character"
        children=" "
      />
    ))}
  </React.Fragment>
);

interface StateProps {
  status: string | null;
  timeMode: string;
  timeElapsed: number;
  length: number | null;
}

interface DispatchProps {
  toggle: () => void;
}

type Props = StateProps & DispatchProps;

const MiniTime = (props: Props) => {
  let seconds = null;
  // TODO: Clean this up: If stopped, just render the background, rather than
  // rendering spaces twice.
  if (props.status !== MEDIA_STATUS.STOPPED && props.length != null) {
    seconds =
      props.timeMode === TIME_MODE.ELAPSED
        ? props.timeElapsed
        : props.length - props.timeElapsed;
  }

  const timeObj = getTimeObj(seconds);
  const showMinus =
    props.timeMode === TIME_MODE.REMAINING &&
    props.status !== MEDIA_STATUS.STOPPED;
  return (
    <div
      onClick={props.toggle}
      className={classnames("mini-time", "countdown", {
        blinking: props.status === MEDIA_STATUS.PAUSED,
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

const mapStateToProps = (state: AppState): StateProps => ({
  status: state.media.status,
  timeMode: state.media.timeMode,
  timeElapsed: Selectors.getTimeElapsed(state),
  length: Selectors.getDuration(state),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  // TODO: move to actionCreators
  toggle: () => {
    dispatch({ type: TOGGLE_TIME_MODE });
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MiniTime);
