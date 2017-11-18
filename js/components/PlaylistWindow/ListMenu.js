import React from "react";
import { connect } from "react-redux";
import PlaylistMenu from "./PlaylistMenu";

/* eslint-disable no-alert */

const ListMenu = () => (
  <PlaylistMenu id="playlist-list-menu">
    <div
      className="new-list"
      onClick={() => alert("Not supported in Winamp2-js")}
    />
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

const mapDispatchToProps = {};
export default connect(null, mapDispatchToProps)(ListMenu);
