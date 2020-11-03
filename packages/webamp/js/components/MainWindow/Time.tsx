import { memo } from "react";
import * as Utils from "../../utils";

import * as Actions from "../../actionCreators";
import * as Selectors from "../../selectors";
import { TIME_MODE } from "../../constants";
import { useActionCreator, useTypedSelector } from "../../hooks";

const Time = memo(() => {
  const toggleTimeMode = useActionCreator(Actions.toggleTimeMode);
  const timeElapsed = useTypedSelector(Selectors.getTimeElapsed);
  const duration = useTypedSelector(Selectors.getDuration) || 0;
  const timeMode = useTypedSelector(Selectors.getTimeMode);
  const seconds =
    timeMode === TIME_MODE.ELAPSED ? timeElapsed : duration - timeElapsed;

  const timeObj = Utils.getTimeObj(seconds);
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
});

export default Time;
