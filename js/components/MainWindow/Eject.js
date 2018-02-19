import React from "react";
import { connect } from "react-redux";

import { openMediaFileDialog } from "../../actionCreators";

const Eject = props => (
  <div id="eject" onClick={props.openMediaFileDialog} title="Open File(s)" />
);

const mapDispatchToProps = { openMediaFileDialog };

export default connect(null, mapDispatchToProps)(Eject);
