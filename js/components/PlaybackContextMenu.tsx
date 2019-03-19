import React from "react";
import { connect } from "react-redux";
import * as Actions from "../actionCreators";
import { Hr, Node } from "./ContextMenu";
import { Dispatch } from "../types";

interface Props {
  previous(): void;
  play(): void;
  pause(): void;
  stop(): void;
  next(): void;
  seekBackward(steps: number): void;
  seekForward(steps: number): void;
  nextN(steps: number): void;
}

const PlaybackContextMenu = (props: Props) => (
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
    <Node
      label="10 tracks back"
      hotkey="Num. 1"
      onClick={() => props.nextN(-10)}
    />
    <Node
      label="10 tracks fwd"
      hotkey="Num. 3"
      onClick={() => props.nextN(10)}
    />
    {/*
    <Hr />
    <Node label="Jump to time" hotkey="Ctrl+J" />
    <Node label="Jump to file" hotkey="J" />
    */}
  </React.Fragment>
);

const mapDispatchToProps = (dispatch: Dispatch): Props => {
  return {
    previous: () => dispatch(Actions.previous()),
    play: () => dispatch(Actions.play()),
    pause: () => dispatch(Actions.pause()),
    stop: () => dispatch(Actions.stop()),
    next: () => dispatch(Actions.next()),
    seekForward: steps => dispatch(Actions.seekForward(steps)),
    seekBackward: steps => dispatch(Actions.seekBackward(steps)),
    nextN: steps => dispatch(Actions.nextN(steps)),
  };
};

export default connect(
  null,
  mapDispatchToProps
)(PlaybackContextMenu);
