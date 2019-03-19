import React from "react";
import { connect } from "react-redux";
import {
  cropPlaylist,
  removeSelectedTracks,
  removeAllTracks,
} from "../../actionCreators";
import PlaylistMenu from "./PlaylistMenu";
import { Dispatch } from "../../types";

/* eslint-disable no-alert */

interface DispatchProps {
  removeSelected: () => void;
  removeAll: () => void;
  crop: () => void;
}

const RemoveMenu = (props: DispatchProps) => (
  <PlaylistMenu id="playlist-remove-menu">
    <div
      className="remove-misc"
      onClick={() => alert("Not supported in Webamp")}
    />
    <div className="remove-all" onClick={props.removeAll} />
    <div className="crop" onClick={props.crop} />
    <div className="remove-selected" onClick={props.removeSelected} />
  </PlaylistMenu>
);

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    removeSelected: () => dispatch(removeSelectedTracks()),
    removeAll: () => dispatch(removeAllTracks()),
    crop: () => dispatch(cropPlaylist()),
  };
};
export default connect(
  () => ({}),
  mapDispatchToProps
)(RemoveMenu);
