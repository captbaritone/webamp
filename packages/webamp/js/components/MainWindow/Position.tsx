import { FormEvent, KeyboardEvent, memo, useCallback, useRef } from "react";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import { getTimeStr } from "../../utils";
import { useTypedSelector, useTypedDispatch } from "../../hooks";

function usePosition() {
  const duration = useTypedSelector(Selectors.getDuration);
  const timeElapsed = useTypedSelector(Selectors.getTimeElapsed);
  const position = duration ? (Math.floor(timeElapsed) / duration) * 100 : 0;
  const scrubPosition = useTypedSelector(Selectors.getUserInputScrubPosition);
  const userInputFocus = useTypedSelector(Selectors.getUserInputFocus);

  const scrubbing = userInputFocus === "position";
  const displayedPosition = scrubbing ? scrubPosition : position;

  // E.g. "0:32 of 2:00"
  let valueText;
  if (duration != null) {
    const time = scrubbing ? (duration * scrubPosition) / 100 : timeElapsed;
    valueText = `${getTimeStr(time)} of ${getTimeStr(duration)}`;
  }

  return [position, displayedPosition, valueText] as const;
}

const Position = memo(() => {
  const [position, displayedPosition, valueText] = usePosition();
  const dispatch = useTypedDispatch();

  const seekToPercentComplete = useCallback(
    (e: FormEvent) => {
      dispatch({
        type: "SEEK_TO_PERCENT_COMPLETE",
        percent: Number((e.target as HTMLInputElement).value),
      });
      dispatch({ type: "UNSET_FOCUS" });
    },
    [dispatch]
  );

  const setPosition = useCallback(
    (e: FormEvent) => {
      dispatch({ type: "SET_FOCUS", input: "position" });
      dispatch({
        type: "SET_SCRUB_POSITION",
        position: Number((e.target as HTMLInputElement).value),
      });
    },
    [dispatch]
  );

  // While the user drags the slider with a pointer we only preview the new
  // position, and seek when they let go. Input that does not come from a
  // pointer (keyboard, or a screen reader's increment/decrement actions) seeks
  // immediately, since there is no "let go" moment.
  const pointerIsDown = useRef(false);

  const handleInput = useCallback(
    (e: FormEvent) => {
      if (pointerIsDown.current) {
        setPosition(e);
      } else {
        seekToPercentComplete(e);
      }
    },
    [setPosition, seekToPercentComplete]
  );

  // The native arrow key step is 1%, which can be less than the one second
  // resolution of the displayed position. Instead, seek by five seconds, like
  // the arrow key hotkeys do.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          dispatch(Actions.seekForward(5));
          break;
        case "ArrowLeft":
        case "ArrowDown":
          dispatch(Actions.seekBackward(5));
          break;
        default:
          return;
      }
      e.preventDefault();
    },
    [dispatch]
  );

  const handlePointerDown = useCallback(
    (e: FormEvent) => {
      pointerIsDown.current = true;
      setPosition(e);
    },
    [setPosition]
  );

  const handlePointerUp = useCallback(
    (e: FormEvent) => {
      pointerIsDown.current = false;
      seekToPercentComplete(e);
    },
    [seekToPercentComplete]
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
      onInput={handleInput}
      onChange={
        () => {} /* React complains without this, can probably rename onInput to onChange */
      }
      onKeyDown={handleKeyDown}
      onPointerUp={handlePointerUp}
      onPointerDown={handlePointerDown}
      title="Seeking Bar"
      aria-valuetext={valueText}
    />
  );
});

export default Position;
