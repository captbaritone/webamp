import React from "react";
import { connect } from "react-redux";
import Slider from "rc-slider";

import { setPlaylistScrollPosition } from "../../actionCreators";
import { getVisibleTrackIds, getPlaylistScrollPosition } from "../../selectors";
import { AppState, Dispatch } from "../../types";

interface StateProps {
  playlistScrollPosition: number;
  allTracksAreVisible: boolean;
}

interface DispatchProps {
  setPlaylistScrollPosition: (value: number) => void;
}

const Handle = () => <div className="playlist-scrollbar-handle" />;

const ScrollBar = (props: StateProps & DispatchProps) => (
  <Slider
    className="playlist-scrollbar"
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

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    setPlaylistScrollPosition: position =>
      dispatch(setPlaylistScrollPosition(100 - position))
  };
};

const mapStateToProps = (state: AppState): StateProps => ({
  playlistScrollPosition: getPlaylistScrollPosition(state),
  allTracksAreVisible:
    getVisibleTrackIds(state).length === state.playlist.trackOrder.length
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScrollBar);
