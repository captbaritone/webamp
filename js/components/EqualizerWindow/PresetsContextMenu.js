import React from "react";
import { connect } from "react-redux";
import { openFileDialog, downloadPreset } from "../../actionCreators";
import { ContextMenu, Node } from "../ContextMenu";

const MainContextMenu = props => (
  <ContextMenu top id="presets-context" handle={<div id="presets" />}>
    <Node onClick={props.openFileDialog.bind(null, ".eqf")} label="Load" />
    <Node onClick={props.downloadPreset} label="Save" />
  </ContextMenu>
);

const mapDispatchToProps = { openFileDialog, downloadPreset };

export default connect(null, mapDispatchToProps)(MainContextMenu);
