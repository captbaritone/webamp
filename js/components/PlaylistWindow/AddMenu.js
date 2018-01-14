import React from "react";
import { connect } from "react-redux";
import { addTracksFromReferences } from "../../actionCreators";
import { promptForFileReferences } from "../../fileUtils";
import PlaylistMenu from "./PlaylistMenu";

/* eslint-disable no-alert */

const AddMenu = ({ nextIndex, addFilesAtIndex }) => (
  <PlaylistMenu id="playlist-add-menu">
    <div
      className="add-url"
      onClick={() => alert("Not supported in Winamp2-js")}
    />
    <div
      className="add-dir"
      onClick={() => alert("Not supported in Winamp2-js")}
    />
    <div className="add-file" onClick={() => addFilesAtIndex(nextIndex)} />
  </PlaylistMenu>
);

const mapStateToProps = state => ({
  nextIndex: state.playlist.trackOrder.length
});

const mapDispatchToProps = dispatch => ({
  addFilesAtIndex: async nextIndex => {
    // TODO: This seems to fail sometimes.
    const fileReferences = await promptForFileReferences();
    dispatch(addTracksFromReferences(fileReferences, false, nextIndex));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(AddMenu);
