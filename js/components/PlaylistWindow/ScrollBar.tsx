import React from "react";
import { connect } from "react-redux";

// Here we import the rc-slider class just to get it's type.
// We expect the Typescript compiler to not actually include this in the bundle.
import RcSlider from "rc-slider";
// @ts-ignore
import SliderComponent from "rc-slider/lib/Slider";

import { setPlaylistScrollPosition } from "../../actionCreators";
import { getVisibleTrackIds, getPlaylistScrollPosition } from "../../selectors";
import { AppState, Dispatch } from "../../types";

// Here we inform TypeScript to use the default export's type for our partial import.
const Slider = SliderComponent as typeof RcSlider;

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
      dispatch(setPlaylistScrollPosition(100 - position)),
  };
};

const mapStateToProps = (state: AppState): StateProps => ({
  playlistScrollPosition: getPlaylistScrollPosition(state),
  allTracksAreVisible:
    getVisibleTrackIds(state).length === state.playlist.trackOrder.length,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScrollBar);
