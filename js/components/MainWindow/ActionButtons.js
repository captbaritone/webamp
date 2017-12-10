import React from "react";
import { connect } from "react-redux";
import { previous, play, pause, stop, next } from "../../actionCreators";

const ActionButtons = props => (
  <div className="actions">
    <div id="previous" onClick={props.previous} title="Previous Track" />
    <div id="play" onClick={props.play} title="Play" />
    <div id="pause" onClick={props.pause} title="Pause" />
    <div id="stop" onClick={props.stop} title="Stop" />
    <div id="next" onClick={props.next} title="Next Track" />
  </div>
);

const mapDispatchToProps = { previous, play, pause, stop, next };

export default connect(null, mapDispatchToProps)(ActionButtons);
