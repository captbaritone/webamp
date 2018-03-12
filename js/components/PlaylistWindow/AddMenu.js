import React from "react";
import { connect } from "react-redux";
import { addTracksFromReferences } from "../../actionCreators";
import { promptForFileReferences } from "../../fileUtils";
import PlaylistMenu from "./PlaylistMenu";

const el = document.createElement("input");
el.type = "file";
const DIR_SUPPORT =
  typeof el.webkitdirectory !== "undefined" ||
  typeof el.mozdirectory !== "undefined" ||
  typeof el.directory !== "undefined";

/* eslint-disable no-alert */

const AddMenu = ({ nextIndex, addFilesAtIndex, addDirAtIndex }) => (
  <PlaylistMenu id="playlist-add-menu">
    <div
      className="add-url"
      onClick={() => alert("Not supported in Winamp2-js")}
    />
    <div className="add-dir" onClick={() => addDirAtIndex(nextIndex)} />
    <div className="add-file" onClick={() => addFilesAtIndex(nextIndex)} />
  </PlaylistMenu>
);

const mapStateToProps = state => ({
  nextIndex: state.playlist.trackOrder.length
});

const mapDispatchToProps = dispatch => ({
  addFilesAtIndex: async nextIndex => {
    const fileReferences = await promptForFileReferences();
    dispatch(addTracksFromReferences(fileReferences, null, nextIndex));
  },
  addDirAtIndex: async nextIndex => {
    if (!DIR_SUPPORT) {
      alert("Not supported in your browser");
      return;
    }
    const fileReferences = await promptForFileReferences({ directory: true });
    dispatch(addTracksFromReferences(fileReferences, null, nextIndex));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(AddMenu);
