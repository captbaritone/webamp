import { useMemo } from "react";

import CharacterString from "../CharacterString";
import * as Actions from "../../selectors";
import { useTypedSelector } from "../../hooks";

// While all the browsers I care about support String.prototype.padEnd,
// Not all node versions do, and I want tests to pass in Jest...
// Sigh.
function rightPad(str: string, len: number, fillChar: string): string {
  while (str.length < len) {
    str += fillChar;
  }
  return str;
}

const RunningTimeDisplay = () => {
  const runningTimeMessage = useTypedSelector(Actions.getRunningTimeMessage);
  const text = useMemo(
    () => rightPad(runningTimeMessage, 18, " "),
    [runningTimeMessage]
  );
  return (
    <div className="playlist-running-time-display draggable">
      {/* This div is probably not strictly needed */}
      <div>
        <CharacterString>{text}</CharacterString>
      </div>
    </div>
  );
};

export default RunningTimeDisplay;
