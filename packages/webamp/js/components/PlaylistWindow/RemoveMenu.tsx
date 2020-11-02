import * as Actions from "../../actionCreators";
import PlaylistMenu from "./PlaylistMenu";
import { useActionCreator } from "../../hooks";

/* eslint-disable no-alert */

const RemoveMenu = () => {
  const removeSelected = useActionCreator(Actions.removeSelectedTracks);
  const removeAll = useActionCreator(Actions.removeAllTracks);
  const crop = useActionCreator(Actions.cropPlaylist);
  return (
    <PlaylistMenu id="playlist-remove-menu">
      <div
        className="remove-misc"
        onClick={() => alert("Not supported in Webamp")}
      />
      <div className="remove-all" onClick={removeAll} />
      <div className="crop" onClick={crop} />
      <div className="remove-selected" onClick={removeSelected} />
    </PlaylistMenu>
  );
};

export default RemoveMenu;
