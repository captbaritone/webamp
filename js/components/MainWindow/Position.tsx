import React from "react";
import { connect } from "react-redux";
import { AppState, Dispatch } from "../../types";

import {
  SEEK_TO_PERCENT_COMPLETE,
  SET_FOCUS,
  UNSET_FOCUS,
  SET_SCRUB_POSITION,
} from "../../actionTypes";
import * as Selectors from "../../selectors";

interface StateProps {
  displayedPosition: number;
  position: number;
}

interface DispatchProps {
  seekToPercentComplete(e: React.MouseEvent<HTMLInputElement>): void;
  setPosition(e: React.MouseEvent<HTMLInputElement>): void;
}

type Props = StateProps & DispatchProps;

const Position = ({
  position,
  seekToPercentComplete,
  displayedPosition,
  setPosition,
}: Props) => {
  // In shade mode, the position slider shows up differently depending on if
  // it's near the start, middle or end of its progress
  let className = "";
  if (position <= 33) {
    className = "left";
  } else if (position >= 66) {
    className = "right";
  }

  return (
    <input
      id="position"
      className={className}
      type="range"
      min="0"
      max="100"
      step="1"
      value={displayedPosition}
      onInput={setPosition}
      onChange={
        () => {} /* React complains without this, can probably rename onInput to onChange */
      }
      onMouseUp={seekToPercentComplete}
      onMouseDown={setPosition}
      title="Seeking Bar"
    />
  );
};

const mapStateToProps = (state: AppState): StateProps => {
  const duration = Selectors.getDuration(state);
  const timeElapsed = Selectors.getTimeElapsed(state);
  const userInputFocus = Selectors.getUserInputFocus(state);
  const scrubPosition = Selectors.getUserInputScrubPosition(state);
  const position = duration ? (Math.floor(timeElapsed) / duration) * 100 : 0;

  const displayedPosition =
    userInputFocus === "position" ? scrubPosition : position;

  return {
    displayedPosition,
    position,
  };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  seekToPercentComplete: e => {
    dispatch({
      type: SEEK_TO_PERCENT_COMPLETE,
      percent: Number((e.target as HTMLInputElement).value),
    });
    dispatch({ type: UNSET_FOCUS });
  },
  setPosition: e => {
    dispatch({ type: SET_FOCUS, input: "position" });
    dispatch({
      type: SET_SCRUB_POSITION,
      position: Number((e.target as HTMLInputElement).value),
    });
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Position);
