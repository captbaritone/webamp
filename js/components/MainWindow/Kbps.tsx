import React from "react";
import { connect } from "react-redux";

import CharacterString from "../CharacterString";
import { AppState } from "../../types";
import * as Selectors from "../../selectors";

interface StateProps {
  kbps: string | null;
}

const Kbps = (props: StateProps) => (
  <div id="kbps">
    <CharacterString>{props.kbps || ""}</CharacterString>
  </div>
);

function mapStateToProps(state: AppState): StateProps {
  return { kbps: Selectors.getKbps(state) };
}

export default connect(mapStateToProps)(Kbps);
