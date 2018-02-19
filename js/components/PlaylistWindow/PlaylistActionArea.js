import React from "react";
import { connect } from "react-redux";

import {
  play,
  pause,
  stop,
  next,
  previous,
  openMediaFileDialog
} from "../../actionCreators";

import MiniTime from "../MiniTime";
import RunningTimeDisplay from "./RunningTimeDisplay";

const PlaylistWindow = props => (
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

const mapDispatchToProps = {
  play,
  pause,
  stop,
  openMediaFileDialog,
  next,
  previous
};

export default connect(null, mapDispatchToProps)(PlaylistWindow);
