import React from "react";
import { connect } from "react-redux";
import Slider from "rc-slider/lib/Slider";

import { setPlaylistScrollPosition } from "../../actionCreators";
import { getVisibleTrackIds, getPlaylistScrollPosition } from "../../selectors";

const Handle = () => <div className="playlist-scrollbar-handle" />;

const ScrollBar = props => (
  <Slider
    className="playlist-scrollbar"
    type="range"
    min={0}
    max={100}
    step={1}
    value={props.playlistScrollPosition}
    onChange={props.setPlaylistScrollPosition}
    vertical
    handle={Handle}
    disabled={props.allTracksAreVisible}
  />
);

const mapDispatchToProps = {
  setPlaylistScrollPosition: position =>
    setPlaylistScrollPosition(100 - position)
};

const mapStateToProps = state => ({
  playlistScrollPosition: getPlaylistScrollPosition(state),
  allTracksAreVisible:
    getVisibleTrackIds(state).length === state.playlist.length
});

export default connect(mapStateToProps, mapDispatchToProps)(ScrollBar);
