import React from "react";
import { connect } from "react-redux";
import { removeAllTracks } from "../../actionCreators";
import PlaylistMenu from "./PlaylistMenu";

/* eslint-disable no-alert */

const ListMenu = props => (
  <PlaylistMenu id="playlist-list-menu">
    <div className="new-list" onClick={props.removeAllTracks} />
    <div
      className="save-list"
      onClick={() => alert("Not supported in Winamp2-js")}
    />
    <div
      className="load-list"
      onClick={() => alert("Not supported in Winamp2-js")}
    />
  </PlaylistMenu>
);

const mapDispatchToProps = {
  removeAllTracks
};
export default connect(null, mapDispatchToProps)(ListMenu);
