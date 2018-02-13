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

const mapDispatchToProps = {
  openFileDialog: () => openFileDialog(".eqf"),
  downloadPreset
};

export default connect(null, mapDispatchToProps)(MainContextMenu);
