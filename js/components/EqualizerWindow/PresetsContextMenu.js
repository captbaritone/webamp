import React from "react";
import { connect } from "react-redux";
import { openFileDialog, downloadPreset } from "../../actionCreators";
import { ContextMenu, Node } from "../ContextMenu";

const MainContextMenu = props => (
  <ContextMenu top id="presets-context" handle={<div id="presets" />}>
    <Node onClick={props.openFileDialog} label="Load" />
    <Node onClick={props.downloadPreset} label="Save" />
  </ContextMenu>
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  openFileDialog: () => dispatch(openFileDialog(ownProps.fileInput)),
  downloadPreset: () => dispatch(downloadPreset())
});

export default connect(null, mapDispatchToProps)(MainContextMenu);
