import React from "react";
import { connect } from "react-redux";
import { SELECT_ALL, SELECT_ZERO, INVERT_SELECTION } from "../../actionTypes";

const SelectionMenu = props => (
  <div id="playlist-selection-menu" className="playlist-menu selected">
    <div className="bar" />
    <ul>
      <li className="invert-selection" onClick={props.invertSelection} />
      <li className="select-zero" onClick={props.selectZero} />
      <li className="select-all" onClick={props.selectAll} />
    </ul>
  </div>
);

const mapDispatchToProps = {
  invertSelection: () => ({ type: INVERT_SELECTION }),
  selectAll: () => ({ type: SELECT_ALL }),
  selectZero: () => ({ type: SELECT_ZERO })
};
export default connect(null, mapDispatchToProps)(SelectionMenu);
