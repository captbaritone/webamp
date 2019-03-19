import React from "react";
import { connect } from "react-redux";
import { removeAllTracks } from "../../actionCreators";
import PlaylistMenu from "./PlaylistMenu";

/* eslint-disable no-alert */

interface DispatchProps {
  removeAllTracks: () => void;
}

const ListMenu = (props: DispatchProps) => (
  <PlaylistMenu id="playlist-list-menu">
    <div className="new-list" onClick={props.removeAllTracks} />
    <div
      className="save-list"
      onClick={() => alert("Not supported in Webamp")}
    />
    <div
      className="load-list"
      onClick={() => alert("Not supported in Webamp")}
    />
  </PlaylistMenu>
);

const mapDispatchToProps = (): DispatchProps => {
  return { removeAllTracks };
};
export default connect(
  null,
  mapDispatchToProps
)(ListMenu);
