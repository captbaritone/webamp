import React from "react";
import { connect } from "react-redux";
import { SELECT_ALL, SELECT_ZERO, INVERT_SELECTION } from "../../actionTypes";
import PlaylistMenu from "./PlaylistMenu";

const SelectionMenu = props => (
  <PlaylistMenu id="playlist-selection-menu">
    <div className="invert-selection" onClick={props.invertSelection} />
    <div className="select-zero" onClick={props.selectZero} />
    <div className="select-all" onClick={props.selectAll} />
  </PlaylistMenu>
);

const mapDispatchToProps = {
  invertSelection: () => ({ type: INVERT_SELECTION }),
  selectAll: () => ({ type: SELECT_ALL }),
  selectZero: () => ({ type: SELECT_ZERO })
};
export default connect(null, mapDispatchToProps)(SelectionMenu);
