import * as Actions from "../../actionCreators";
import PlaylistMenu from "./PlaylistMenu";
import { useActionCreator } from "../../hooks";

/* eslint-disable no-alert */
export default function ListMenu() {
  const removeAllTracks = useActionCreator(Actions.removeAllTracks);
  const addFilesFromList = useActionCreator(Actions.addFilesFromList);
  const saveFilesToList = useActionCreator(Actions.saveFilesToList);
  return (
    <PlaylistMenu id="playlist-list-menu">
      <div className="new-list" onClick={removeAllTracks} />
      <div className="save-list" onClick={saveFilesToList} />
      <div className="load-list" onClick={addFilesFromList} />
    </PlaylistMenu>
  );
}
