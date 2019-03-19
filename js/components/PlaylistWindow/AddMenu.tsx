import React from "react";
import { connect } from "react-redux";
import { LOAD_STYLE } from "../../constants";
import { getTrackCount } from "../../selectors";
import { addTracksFromReferences } from "../../actionCreators";
import { promptForFileReferences } from "../../fileUtils";
import PlaylistMenu from "./PlaylistMenu";
import { AppState, Dispatch } from "../../types";

interface StateProps {
  nextIndex: number;
}

interface DispatchProps {
  addFilesAtIndex(i: number): void;
  addDirAtIndex(i: number): void;
}
const el = document.createElement("input");
el.type = "file";
// @ts-ingore
const DIR_SUPPORT =
  // @ts-ignore
  typeof el.webkitdirectory !== "undefined" ||
  // @ts-ignore
  typeof el.mozdirectory !== "undefined" ||
  // @ts-ignore
  typeof el.directory !== "undefined";

/* eslint-disable no-alert */

const AddMenu = ({
  nextIndex,
  addFilesAtIndex,
  addDirAtIndex,
}: StateProps & DispatchProps) => (
  <PlaylistMenu id="playlist-add-menu">
    <div className="add-url" onClick={() => alert("Not supported in Webamp")} />
    <div className="add-dir" onClick={() => addDirAtIndex(nextIndex)} />
    <div className="add-file" onClick={() => addFilesAtIndex(nextIndex)} />
  </PlaylistMenu>
);

const mapStateToProps = (state: AppState): StateProps => ({
  nextIndex: getTrackCount(state),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  addFilesAtIndex: async nextIndex => {
    const fileReferences = await promptForFileReferences();
    dispatch(
      addTracksFromReferences(fileReferences, LOAD_STYLE.NONE, nextIndex)
    );
  },
  addDirAtIndex: async nextIndex => {
    if (!DIR_SUPPORT) {
      alert("Not supported in your browser");
      return;
    }
    const fileReferences = await promptForFileReferences({ directory: true });
    dispatch(
      addTracksFromReferences(fileReferences, LOAD_STYLE.NONE, nextIndex)
    );
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddMenu);
