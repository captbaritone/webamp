import React from "react";
import { connect } from "react-redux";
import {
  previous,
  play,
  pause,
  stop,
  next,
  seekForward,
  seekBackward,
  nextN
} from "../actionCreators";
import { Hr, Node } from "./ContextMenu";

const PlaybackContextMenu = props => (
  <React.Fragment>
    <Node label="Previous" hotkey="Z" onClick={props.previous} />
    <Node label="Play" hotkey="X" onClick={props.play} />
    <Node label="Pause" hotkey="C" onClick={props.pause} />
    <Node label="Stop" hotkey="V" onClick={props.stop} />
    <Node label="Next" hotkey="B" onClick={props.next} />
    <Hr />
    {/*
    <Node label="Stop w/ fadeout" hotkey="Shift+V" />
    <Node label="Stop after current" hotkey="Ctrl+V" />
    */}
    <Node
      label="Back 5 seconds"
      hotkey="Left"
      onClick={() => props.seekBackward(5)}
    />
    <Node
      label="Fwd 5 seconds"
      hotkey="Right"
      onClick={() => props.seekForward(5)}
    />
    {/*
    <Node label="Start of list" hotkey="Ctrl+Z" />
    */}
    <Node label="10 tracks back" hotkey="Num. 1" onClick={() => nextN(-10)} />
    <Node label="10 tracks fwd" hotkey="Num. 3" onClick={() => nextN(10)} />
    {/*
    <Hr />
    <Node label="Jump to time" hotkey="Ctrl+J" />
    <Node label="Jump to file" hotkey="J" />
    */}
  </React.Fragment>
);

const mapDispatchToProps = {
  previous,
  play,
  pause,
  stop,
  next,
  seekForward,
  seekBackward
};

export default connect(
  null,
  mapDispatchToProps
)(PlaybackContextMenu);
