import React from "react";
import { connect } from "react-redux";

import CharacterString from "../CharacterString";

const Khz = props => (
  <div id="khz">
    <CharacterString>{props.khz}</CharacterString>
  </div>
);

export default connect(state => state.media)(Khz);
