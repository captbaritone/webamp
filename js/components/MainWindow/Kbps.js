import React from "react";
import { connect } from "react-redux";

import CharacterString from "../CharacterString";

const Kbps = props => (
  <div id="kbps">
    <CharacterString>{props.kbps}</CharacterString>
  </div>
);

export default connect(state => ({ kbps: state.media.kbps }))(Kbps);
