import React from "react";
import { connect } from "react-redux";
import { openEqfFileDialog, downloadPreset } from "../../actionCreators";
import { Node } from "../ContextMenu";
import ContextMenuTarget from "../ContextMenuTarget";

const PresetsContextMenu = props => (
  <ContextMenuTarget top id="presets-context" handle={<div id="presets" />}>
    <Node onClick={props.openEqfFileDialog} label="Load" />
    <Node onClick={props.downloadPreset} label="Save" />
  </ContextMenuTarget>
);

const mapDispatchToProps = { openEqfFileDialog, downloadPreset };

export default connect(null, mapDispatchToProps)(PresetsContextMenu);
