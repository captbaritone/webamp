import React from "react";
import { connect } from "react-redux";

import CharacterString from "../CharacterString";
import { getRunningTimeMessage } from "../../selectors";

// While all the browsers I care about support String.prototype.padEnd,
// Not all node versions do, and I want tests to pass in Jest...
// Sigh.
function rightPad(str, len, fillChar) {
  while (str.length < len) {
    str += fillChar;
  }
  return str;
}

const RunningTimeDisplay = props => (
  <div className="playlist-running-time-display draggable">
    <CharacterString>
      {rightPad(props.runningTimeMessage, 18, " ")}
    </CharacterString>
  </div>
);

const mapStateToProps = state => ({
  runningTimeMessage: getRunningTimeMessage(state)
});

export default connect(mapStateToProps)(RunningTimeDisplay);
