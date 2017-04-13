import React from "react";
import { connect } from "react-redux";

import {
  SEEK_TO_PERCENT_COMPLETE,
  SET_FOCUS,
  UNSET_FOCUS,
  SET_SCRUB_POSITION
} from "../actionTypes";

const Position = ({
  position,
  seekToPercentComplete,
  displayedPosition,
  setPosition
}) => {
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
      onChange={setPosition}
      onInput={setPosition}
      onMouseUp={seekToPercentComplete}
      onMouseDown={setPosition}
    />
  );
};

const mapStateToProps = ({ media, userInput }) => {
  const position = media.length ? media.timeElapsed / media.length * 100 : 0;

  const displayedPosition = userInput.focus === "position"
    ? userInput.scrubPosition
    : position;

  return {
    displayedPosition,
    position
  };
};

const mapDispatchToProps = dispatch => ({
  seekToPercentComplete: e => {
    dispatch({ type: SEEK_TO_PERCENT_COMPLETE, percent: e.target.value });
    dispatch({ type: UNSET_FOCUS });
  },
  setPosition: e => {
    dispatch({ type: SET_FOCUS, input: "position" });
    dispatch({ type: SET_SCRUB_POSITION, position: e.target.value });
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Position);
