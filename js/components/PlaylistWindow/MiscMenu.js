import React from "react";
import { connect } from "react-redux";
import { FILE_INFO } from "../../actionTypes";

const MiscMenu = props => (
  <div id="playlist-misc-menu" className="playlist-menu selected">
    <div className="bar" />
    <ul>
      <li className="sort-list" />
      <li className="file-info" onClick={props.fileInfo} />
      <li className="misc-options" />
    </ul>
  </div>
);

const mapDispatchToProps = {
  fileInfo: () => ({ type: FILE_INFO })
};
export default connect(null, mapDispatchToProps)(MiscMenu);
