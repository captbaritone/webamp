import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import PlaylistMenu from "./PlaylistMenu";

import { useTypedSelector, useActionCreator } from "../../hooks";

const AddMenu = () => {
  const nextIndex = useTypedSelector(Selectors.getTrackCount);
  const addDirAtIndex = useActionCreator(Actions.addDirAtIndex);
  const addFilesAtIndex = useActionCreator(Actions.addFilesAtIndex);
  const addFilesFromUrl = useActionCreator(Actions.addFilesFromUrl);
  return (
    <PlaylistMenu id="playlist-add-menu">
      <div className="add-url" onClick={() => addFilesFromUrl(nextIndex)} />
      <div className="add-dir" onClick={() => addDirAtIndex(nextIndex)} />
      <div className="add-file" onClick={() => addFilesAtIndex(nextIndex)} />
    </PlaylistMenu>
  );
};

export default AddMenu;
