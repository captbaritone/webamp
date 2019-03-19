import React from "react";
import { connect } from "react-redux";
import { previous, play, pause, stop, next } from "../../actionCreators";
import { Dispatch } from "../../types";

interface DispatchProps {
  previous(): void;
  play(): void;
  pause(): void;
  stop(): void;
  next(): void;
}

const ActionButtons = (props: DispatchProps) => (
  <div className="actions">
    <div id="previous" onClick={props.previous} title="Previous Track" />
    <div id="play" onClick={props.play} title="Play" />
    <div id="pause" onClick={props.pause} title="Pause" />
    <div id="stop" onClick={props.stop} title="Stop" />
    <div id="next" onClick={props.next} title="Next Track" />
  </div>
);

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    previous: () => dispatch(previous()),
    play: () => dispatch(play()),
    pause: () => dispatch(pause()),
    stop: () => dispatch(stop()),
    next: () => dispatch(next()),
  };
};

export default connect(
  null,
  mapDispatchToProps
)(ActionButtons);
