import React from "react";
import { connect } from "react-redux";
import { TimeMode, AppState, Dispatch } from "../../types";
import { getTimeObj } from "../../utils";

import * as Actions from "../../actionCreators";
import * as Selectors from "../../selectors";
import { TIME_MODE } from "../../constants";

interface StateProps {
  timeElapsed: number;
  duration: number;
  timeMode: TimeMode;
}

interface DispatchProps {
  toggleTimeMode(): void;
}

const Time = ({
  timeElapsed,
  duration,
  timeMode,
  toggleTimeMode,
}: StateProps & DispatchProps) => {
  const seconds =
    timeMode === TIME_MODE.ELAPSED ? timeElapsed : duration - timeElapsed;

  const timeObj = getTimeObj(seconds);
  return (
    <div id="time" onClick={toggleTimeMode} className="countdown">
      {timeMode === TIME_MODE.REMAINING && <div id="minus-sign" />}
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

const mapStateToProps = (state: AppState): StateProps => {
  const timeElapsed = Selectors.getTimeElapsed(state);
  const duration = Selectors.getDuration(state);
  const { timeMode } = state.media;
  return { timeElapsed, duration: duration || 0, timeMode };
};
const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  toggleTimeMode: () => dispatch(Actions.toggleTimeMode()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Time);
