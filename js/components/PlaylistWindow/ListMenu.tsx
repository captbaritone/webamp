import React from "react";
import { connect } from "react-redux";
import * as Actions from "../../actionCreators";
import PlaylistMenu from "./PlaylistMenu";
import { Dispatch } from "../../types";

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

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  removeAllTracks: () => dispatch(Actions.removeAllTracks()),
});

export default connect(
  null,
  mapDispatchToProps
)(ListMenu);
