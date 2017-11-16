import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { getTimeStr } from "../../utils";
import { CLICKED_TRACK, CTRL_CLICKED_TRACK } from "../../actionTypes";

const Track = props => {
  const {
    skinPlaylistStyle,
    artist,
    selected,
    current,
    title,
    number,
    duration,
    clickTrack,
    ctrlClickTrack
  } = props;
  const style = {
    backgroundColor: selected ? skinPlaylistStyle.selectedbg : null,
    color: current ? skinPlaylistStyle.current : null
  };
  return (
    <div
      className={classnames("playlist-track", { selected, current })}
      style={style}
      onClick={clickTrack}
      onContextMenu={ctrlClickTrack}
    >
      <div className="playlist-track-number">{number}.</div>
      <div className="playlist-track-title">
        <span>
          {artist} - {title}
        </span>
      </div>
      <div className="playlist-track-duration">{getTimeStr(duration)}</div>
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
    artist: track.artist,
    title: track.title,
    duration: track.duration,
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
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Track);
