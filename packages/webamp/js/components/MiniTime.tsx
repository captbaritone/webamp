import { Fragment } from "react";
import classnames from "classnames";
import { getTimeObj } from "../utils";
import { TIME_MODE, MEDIA_STATUS } from "../constants";
import * as Actions from "../actionCreators";
import Character from "./Character";
import * as Selectors from "../selectors";

import "../../css/mini-time.css";
import { useTypedSelector, useActionCreator } from "../hooks";

// Sigh. When the display is blinking (say when it's paused) we need to
// alternate between the actual character and the space character. Not
// Possible to do that in pure CSS with the background being dynamically generated.
// All "space" characters is also how Winamp renders no content.
const Background = () => (
  <Fragment>
    {[1, 7, 12, 20, 25].map((left, i) => (
      <Character
        style={{ left }}
        key={i}
        className="background-character"
        children=" "
      />
    ))}
  </Fragment>
);

const MiniTime = () => {
  const status = useTypedSelector(Selectors.getMediaStatus);
  const duration = useTypedSelector(Selectors.getDuration);
  const timeElapsed = useTypedSelector(Selectors.getTimeElapsed);
  const timeMode = useTypedSelector(Selectors.getTimeMode);

  const toggle = useActionCreator(Actions.toggleTimeMode);
  let seconds = null;
  // TODO: Clean this up: If stopped, just render the background, rather than
  // rendering spaces twice.
  if (status !== MEDIA_STATUS.STOPPED && duration != null) {
    seconds =
      timeMode === TIME_MODE.ELAPSED ? timeElapsed : duration - timeElapsed;
  }

  const timeObj = getTimeObj(seconds);
  const showMinus =
    timeMode === TIME_MODE.REMAINING && status !== MEDIA_STATUS.STOPPED;
  return (
    <div
      onClick={toggle}
      className={classnames("mini-time", "countdown", {
        blinking: status === MEDIA_STATUS.PAUSED,
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

export default MiniTime;
