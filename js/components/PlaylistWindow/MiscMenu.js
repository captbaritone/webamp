import React from "react";
import { connect } from "react-redux";
import { FILE_INFO } from "../../actionTypes";
import PlaylistMenu from "./PlaylistMenu";

const MiscMenu = props => (
  <PlaylistMenu id="playlist-misc-menu">
    <div className="sort-list" />
    <div className="file-info" onClick={props.fileInfo} />
    <div className="misc-options" />
  </PlaylistMenu>
);

const mapDispatchToProps = {
  fileInfo: () => ({ type: FILE_INFO })
};
export default connect(null, mapDispatchToProps)(MiscMenu);
