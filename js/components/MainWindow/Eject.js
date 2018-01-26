import React from "react";
import { connect } from "react-redux";

import { openFileDialog } from "../../actionCreators";

const Eject = props => (
  <div id="eject" onClick={props.openFileDialog} title="Open File(s)" />
);

const mapDispatchToProps = { openFileDialog };

export default connect(null, mapDispatchToProps)(Eject);
