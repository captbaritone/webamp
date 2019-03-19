import React from "react";
import { connect } from "react-redux";

import CharacterString from "../CharacterString";
import { getRunningTimeMessage } from "../../selectors";
import { AppState } from "../../types";

// While all the browsers I care about support String.prototype.padEnd,
// Not all node versions do, and I want tests to pass in Jest...
// Sigh.
function rightPad(str: string, len: number, fillChar: string): string {
  while (str.length < len) {
    str += fillChar;
  }
  return str;
}

interface Props {
  runningTimeMessage: string;
}

const RunningTimeDisplay = (props: Props) => (
  <div className="playlist-running-time-display draggable">
    {/* This div is probably not strictly needed */}
    <div>
      <CharacterString>
        {rightPad(props.runningTimeMessage, 18, " ")}
      </CharacterString>
    </div>
  </div>
);

const mapStateToProps = (state: AppState): Props => ({
  runningTimeMessage: getRunningTimeMessage(state),
});

export default connect(mapStateToProps)(RunningTimeDisplay);
