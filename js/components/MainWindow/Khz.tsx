import React from "react";
import { connect } from "react-redux";

import CharacterString from "../CharacterString";
import { AppState } from "../../types";
import * as Selectors from "../../selectors";

interface StateProps {
  khz: string | null;
}

const Khz = (props: StateProps) => (
  <div id="khz">
    <CharacterString>{props.khz || ""}</CharacterString>
  </div>
);

function mapStateToProps(state: AppState): StateProps {
  return { khz: Selectors.getKhz(state) };
}

export default connect(mapStateToProps)(Khz);
