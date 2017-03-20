import React from "react";
import { connect } from "react-redux";

import { openFileDialog } from "../actionCreators";

const Eject = props => <div id="eject" onClick={props.openFileDialog} />;

const mapDispatchToProps = (dispatch, ownProps) => ({
  openFileDialog: () => dispatch(openFileDialog(ownProps.fileInput))
});

export default connect(() => ({}), mapDispatchToProps)(Eject);
