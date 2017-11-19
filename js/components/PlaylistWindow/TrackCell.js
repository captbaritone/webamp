import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import {
  CLICKED_TRACK,
  CTRL_CLICKED_TRACK,
  PLAY_TRACK
} from "../../actionTypes";

const TrackCell = props => {
  const {
    skinPlaylistStyle,
    selected,
    current,
    clickTrack,
    ctrlClickTrack,
    playTrack,
    children
  } = props;
  const style = {
    backgroundColor: selected ? skinPlaylistStyle.selectedbg : null,
    color: current ? skinPlaylistStyle.current : null
  };
  return (
    <div
      className={classnames({ selected, current })}
      style={style}
      onClick={clickTrack}
      onDoubleClick={playTrack}
      onContextMenu={ctrlClickTrack}
    >
      {children}
    </div>
  );
};

const mapStateToProps = (state, ownProps) => {
  const {
    display: { skinPlaylistStyle },
    playlist: { currentTrack },
    tracks
  } = state;
  const track = tracks[ownProps.id];
  return {
    skinPlaylistStyle,
    selected: track.selected,
    current: currentTrack === ownProps.id
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  clickTrack: () => dispatch({ type: CLICKED_TRACK, id: ownProps.id }),
  ctrlClickTrack: e => {
    if (e.ctrlKey) {
      e.preventDefault();
      return dispatch({ type: CTRL_CLICKED_TRACK, id: ownProps.id });
    }
    return null;
    // TODO: We need to spawn our own context menu
  },
  playTrack: () => dispatch({ type: PLAY_TRACK, id: ownProps.id })
});

export default connect(mapStateToProps, mapDispatchToProps)(TrackCell);
