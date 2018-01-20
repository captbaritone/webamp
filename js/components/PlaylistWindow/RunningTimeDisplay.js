import React from "react";
import { connect } from "react-redux";

import CharacterString from "../CharacterString";
import { getRunningTimeMessage } from "../../selectors";

const RunningTimeDisplay = props => (
  <div className="playlist-running-time-display draggable">
    <CharacterString>
      {props.runningTimeMessage.padEnd(18, " ")}
    </CharacterString>
  </div>
);

const mapStateToProps = state => ({
  runningTimeMessage: getRunningTimeMessage(state)
});

export default connect(mapStateToProps)(RunningTimeDisplay);
