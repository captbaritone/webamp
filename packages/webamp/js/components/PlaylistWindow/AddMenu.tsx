import React from "react";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import PlaylistMenu from "./PlaylistMenu";

import { useTypedSelector, useActionCreator } from "../../hooks";

const AddMenu = () => {
  const nextIndex = useTypedSelector(Selectors.getTrackCount);
  const addDirAtIndex = useActionCreator(Actions.addDirAtIndex);
  const addFilesAtIndex = useActionCreator(Actions.addFilesAtIndex);
  return (
    <PlaylistMenu id="playlist-add-menu">
      <div
        className="add-url"
        onClick={() => window.alert("Not supported in Webamp")}
      />
      <div className="add-dir" onClick={() => addDirAtIndex(nextIndex)} />
      <div className="add-file" onClick={() => addFilesAtIndex(nextIndex)} />
    </PlaylistMenu>
  );
};

export default AddMenu;
