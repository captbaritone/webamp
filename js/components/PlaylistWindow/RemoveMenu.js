import React from "react";
import { connect } from "react-redux";
import { REMOVE_ALL_TRACKS } from "../../actionTypes";
import { cropPlaylist, removeSelectedTracks } from "../../actionCreators";
import PlaylistMenu from "./PlaylistMenu";

/* eslint-disable no-alert */

const RemoveMenu = props => (
  <PlaylistMenu id="playlist-remove-menu">
    <div
      className="remove-misc"
      onClick={() => alert("Not supported in Winamp2-js")}
    />
    <div className="remove-all" onClick={props.removeAll} />
    <div className="crop" onClick={props.crop} />
    <div className="remove-selected" onClick={props.removeSelected} />
  </PlaylistMenu>
);

const mapDispatchToProps = {
  removeSelected: removeSelectedTracks,
  removeAll: () => ({ type: REMOVE_ALL_TRACKS }),
  crop: cropPlaylist
};
export default connect(null, mapDispatchToProps)(RemoveMenu);
