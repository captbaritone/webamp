import { memo, useCallback } from "react";

import {
  SEEK_TO_PERCENT_COMPLETE,
  SET_FOCUS,
  UNSET_FOCUS,
  SET_SCRUB_POSITION,
} from "../../actionTypes";
import * as Selectors from "../../selectors";
import { useTypedSelector, useTypedDispatch } from "../../hooks";

function usePosition() {
  const duration = useTypedSelector(Selectors.getDuration);
  const timeElapsed = useTypedSelector(Selectors.getTimeElapsed);
  const position = duration ? (Math.floor(timeElapsed) / duration) * 100 : 0;
  const scrubPosition = useTypedSelector(Selectors.getUserInputScrubPosition);
  const userInputFocus = useTypedSelector(Selectors.getUserInputFocus);

  const displayedPosition =
    userInputFocus === "position" ? scrubPosition : position;

  return [position, displayedPosition];
}

const Position = memo(() => {
  const [position, displayedPosition] = usePosition();
  const dispatch = useTypedDispatch();

  const seekToPercentComplete = useCallback(
    (e) => {
      dispatch({
        type: SEEK_TO_PERCENT_COMPLETE,
        percent: Number((e.target as HTMLInputElement).value),
      });
      dispatch({ type: UNSET_FOCUS });
    },
    [dispatch]
  );

  const setPosition = useCallback(
    (e) => {
      dispatch({ type: SET_FOCUS, input: "position" });
      dispatch({
        type: SET_SCRUB_POSITION,
        position: Number((e.target as HTMLInputElement).value),
      });
    },
    [dispatch]
  );

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
      style={{ touchAction: "none" }}
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
});

export default Position;
