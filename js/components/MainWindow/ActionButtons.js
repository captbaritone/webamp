import React from "react";
import { connect } from "react-redux";
import { play, pause, stop } from "../../actionCreators";

const ActionButtons = props => (
  <div className="actions">
    <div id="previous" title="Previous Track" />
    <div id="play" onClick={props.play} title="Play" />
    <div id="pause" onClick={props.pause} title="Pause" />
    <div id="stop" onClick={props.stop} title="Stop" />
    <div id="next" title="Next Track" />
  </div>
);

const mapStateToProps = state => state.media;

const mapDispatchToProps = {
  play,
  pause,
  stop
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionButtons);
