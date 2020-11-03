import { Fragment } from "react";

import * as Actions from "../../actionCreators";

import MiniTime from "../MiniTime";
import RunningTimeDisplay from "./RunningTimeDisplay";
import { useActionCreator } from "../../hooks";

const PlaylistWindow = () => {
  const play = useActionCreator(Actions.play);
  const pause = useActionCreator(Actions.pause);
  const stop = useActionCreator(Actions.stop);
  const openMediaFileDialog = useActionCreator(Actions.openMediaFileDialog);
  const next = useActionCreator(Actions.next);
  const previous = useActionCreator(Actions.previous);
  return (
    <Fragment>
      <RunningTimeDisplay />
      <div className="playlist-action-buttons">
        <div className="playlist-previous-button" onClick={previous} />
        <div className="playlist-play-button" onClick={play} />
        <div className="playlist-pause-button" onClick={pause} />
        <div className="playlist-stop-button" onClick={stop} />
        <div className="playlist-next-button" onClick={next} />
        <div className="playlist-eject-button" onClick={openMediaFileDialog} />
      </div>
      <MiniTime />
    </Fragment>
  );
};
export default PlaylistWindow;
