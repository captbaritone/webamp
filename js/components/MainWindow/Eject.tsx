import React from "react";
import { connect } from "react-redux";

import * as Actions from "../../actionCreators";
import { Dispatch } from "../../types";

interface DispatchProps {
  openMediaFileDialog(): void;
}

const Eject = (props: DispatchProps) => (
  <div id="eject" onClick={props.openMediaFileDialog} title="Open File(s)" />
);

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  openMediaFileDialog: () => dispatch(Actions.openMediaFileDialog()),
});

export default connect(
  null,
  mapDispatchToProps
)(Eject);
