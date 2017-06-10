import React from "react";
import { connect } from "react-redux";
import { CLOSE_PRESETS_CONTEXT_MENU } from "../actionTypes";
import { openFileDialog, downloadPreset } from "../actionCreators";
import { ContextMenu, Node } from "./ContextMenu";

const MainContextMenu = props =>
  <ContextMenu closeMenu={props.closeMenu} selected={props.selected} top>
    <Node onClick={props.openFileDialog} label="Load" />
    <Node onClick={props.downloadPreset} label="Save" />
  </ContextMenu>;

const mapDispatchToProps = (dispatch, ownProps) => ({
  closeMenu: () => dispatch({ type: CLOSE_PRESETS_CONTEXT_MENU }),
  openFileDialog: () => dispatch(openFileDialog(ownProps.fileInput)),
  downloadPreset: () => dispatch(downloadPreset())
});

export default connect(null, mapDispatchToProps)(MainContextMenu);
