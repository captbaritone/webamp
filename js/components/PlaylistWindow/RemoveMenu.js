import React from "react";
import { connect } from "react-redux";
import {
  REMOVE_ALL_TRACKS,
  CROP_TRACKS,
  REMOVE_SELECTED_TRACKS
} from "../../actionTypes";
import PlaylistMenu from "./PlaylistMenu";

const RemoveMenu = props => (
  <PlaylistMenu id="playlist-remove-menu">
    <li className="remove-misc" onClick={props.removeSelected} />
    <li className="remove-all" onClick={props.removeAll} />
    <li className="crop" onClick={props.crop} />
    <li className="remove-selected" onClick={props.removeSelected} />
  </PlaylistMenu>
);

const mapDispatchToProps = {
  removeSelected: () => ({ type: REMOVE_SELECTED_TRACKS }),
  removeAll: () => ({ type: REMOVE_ALL_TRACKS }),
  crop: () => ({ type: CROP_TRACKS })
};
export default connect(null, mapDispatchToProps)(RemoveMenu);
