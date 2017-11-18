import React from "react";
import PlaylistMenu from "./PlaylistMenu";

/* eslint-disable no-alert */

const AddMenu = ({ openFileDialog }) => (
  <PlaylistMenu id="playlist-add-menu">
    <div
      className="add-url"
      onClick={() => alert("Not supported in Winamp2-js")}
    />
    <div
      className="add-dir"
      onClick={() => alert("Not supported in Winamp2-js")}
    />
    <div className="add-file" onClick={openFileDialog} />
  </PlaylistMenu>
);

export default AddMenu;
