import React from "react";
import { connect } from "react-redux";
import {
  REMOVE_ALL_TRACKS,
  CROP_TRACKS,
  REMOVE_SELECTED_TRACKS
} from "../../actionTypes";

const RemoveMenu = props => (
  <div id="playlist-remove-menu" className="playlist-menu selected">
    <div className="bar" />
    <ul>
      <li className="remove-misc" onClick={props.removeSelected} />
      <li className="remove-all" onClick={props.removeAll} />
      <li className="crop" onClick={props.crop} />
      <li className="remove-selected" onClick={props.removeSelected} />
    </ul>
  </div>
);

const mapDispatchToProps = {
  removeSelected: () => ({ type: REMOVE_SELECTED_TRACKS }),
  removeAll: () => ({ type: REMOVE_ALL_TRACKS }),
  crop: () => ({ type: CROP_TRACKS })
};
export default connect(null, mapDispatchToProps)(RemoveMenu);
