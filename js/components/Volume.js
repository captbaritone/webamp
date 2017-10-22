import React from "react";
import { connect } from "react-redux";
import { setVolume } from "../actionCreators";

import { SET_FOCUS, UNSET_FOCUS } from "../actionTypes";

const Volume = props => (
  <input
    id={props.id}
    type="range"
    min="0"
    max="100"
    step="1"
    value={props.volume}
    style={props.style}
    className={props.className}
    onChange={props.setVolume}
    onMouseDown={props.showMarquee}
    onMouseUp={props.hideMarquee}
    title="Volume Bar"
  />
);

const mapStateToProps = state => ({
  volume: state.media.volume
});

const mapDispatchToProps = dispatch => ({
  showMarquee: () => dispatch({ type: SET_FOCUS, input: "volume" }),
  hideMarquee: () => dispatch({ type: UNSET_FOCUS }),
  setVolume: e => dispatch(setVolume(e.target.value))
});

export default connect(mapStateToProps, mapDispatchToProps)(Volume);
