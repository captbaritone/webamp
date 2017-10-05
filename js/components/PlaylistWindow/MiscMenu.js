import React from "react";
import { connect } from "react-redux";
import { FILE_INFO } from "../../actionTypes";
import PlaylistMenu from "./PlaylistMenu";

const MiscMenu = props => (
  <PlaylistMenu id="playlist-misc-menu">
    <li className="sort-list" />
    <li className="file-info" onClick={props.fileInfo} />
    <li className="misc-options" />
  </PlaylistMenu>
);

const mapDispatchToProps = {
  fileInfo: () => ({ type: FILE_INFO })
};
export default connect(null, mapDispatchToProps)(MiscMenu);
