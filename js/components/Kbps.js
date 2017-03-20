import React from "react";
import { connect } from "react-redux";

import CharacterString from "./CharacterString";

const Kbps = props => (
  <CharacterString id="kbps">
    {props.kbps}
  </CharacterString>
);

export default connect(state => state.media)(Kbps);
