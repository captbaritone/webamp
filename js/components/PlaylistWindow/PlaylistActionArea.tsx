import React from "react";
import { connect } from "react-redux";

import {
  play,
  pause,
  stop,
  next,
  previous,
  openMediaFileDialog,
} from "../../actionCreators";

import MiniTime from "../MiniTime";
import RunningTimeDisplay from "./RunningTimeDisplay";
import { Dispatch } from "../../types";

interface Props {
  previous: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  openMediaFileDialog: () => void;
}

const PlaylistWindow = (props: Props) => (
  <React.Fragment>
    <RunningTimeDisplay />
    <div className="playlist-action-buttons">
      <div className="playlist-previous-button" onClick={props.previous} />
      <div className="playlist-play-button" onClick={props.play} />
      <div className="playlist-pause-button" onClick={props.pause} />
      <div className="playlist-stop-button" onClick={props.stop} />
      <div className="playlist-next-button" onClick={props.next} />
      <div
        className="playlist-eject-button"
        onClick={props.openMediaFileDialog}
      />
    </div>
    <MiniTime />
  </React.Fragment>
);

const mapDispatchToProps = (dispatch: Dispatch): Props => {
  return {
    play: () => dispatch(play()),
    pause: () => dispatch(pause()),
    stop: () => dispatch(stop()),
    openMediaFileDialog: () => dispatch(openMediaFileDialog()),
    next: () => dispatch(next()),
    previous: () => dispatch(previous()),
  };
};

export default connect(
  null,
  mapDispatchToProps
)(PlaylistWindow);
