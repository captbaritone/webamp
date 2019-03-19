import React from "react";
import { connect } from "react-redux";
import { SELECT_ALL, SELECT_ZERO, INVERT_SELECTION } from "../../actionTypes";
import PlaylistMenu from "./PlaylistMenu";
import { Dispatch } from "../../types";

interface DispatchProps {
  invertSelection: () => void;
  selectZero: () => void;
  selectAll: () => void;
}

const SelectionMenu = (props: DispatchProps) => (
  <PlaylistMenu id="playlist-selection-menu">
    <div className="invert-selection" onClick={props.invertSelection} />
    <div className="select-zero" onClick={props.selectZero} />
    <div className="select-all" onClick={props.selectAll} />
  </PlaylistMenu>
);

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    invertSelection: () => dispatch({ type: INVERT_SELECTION }),
    selectAll: () => dispatch({ type: SELECT_ALL }),
    selectZero: () => dispatch({ type: SELECT_ZERO }),
  };
};
export default connect(
  null,
  mapDispatchToProps
)(SelectionMenu);
