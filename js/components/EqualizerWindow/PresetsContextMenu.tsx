import React from "react";
import { connect } from "react-redux";
import { openEqfFileDialog, downloadPreset } from "../../actionCreators";
import { Node } from "../ContextMenu";
import ContextMenuTarget from "../ContextMenuTarget";
import { Dispatch } from "../../types";

interface DispatchProps {
  openEqfFileDialog(): void;
  downloadPreset(): void;
}

const PresetsContextMenu = (props: DispatchProps) => (
  <ContextMenuTarget top id="presets-context" handle={<div id="presets" />}>
    <Node onClick={props.openEqfFileDialog} label="Load" />
    <Node onClick={props.downloadPreset} label="Save" />
  </ContextMenuTarget>
);

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    openEqfFileDialog: () => dispatch(openEqfFileDialog()),
    downloadPreset: () => dispatch(downloadPreset())
  };
};

export default connect(
  null,
  mapDispatchToProps
)(PresetsContextMenu);
