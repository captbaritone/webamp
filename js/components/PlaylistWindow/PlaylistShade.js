import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { getTimeStr } from "../../utils";
import {
  TOGGLE_PLAYLIST_WINDOW,
  TOGGLE_PLAYLIST_SHADE_MODE,
  SET_FOCUSED_WINDOW
} from "../../actionTypes";

import {
  WINDOWS,
  PLAYLIST_RESIZE_SEGMENT_WIDTH,
  MIN_PLAYLIST_WINDOW_WIDTH
} from "../../constants";
import CharacterString from "../CharacterString";

import { getOrderedTracks } from "../../selectors";

const PlaylistShade = props => {
  const {
    toggleShade,
    close,
    focusPlaylist,
    playlistSize,
    focused,
    name,
    length
  } = props;

  const style = {
    width: `${MIN_PLAYLIST_WINDOW_WIDTH +
      playlistSize[0] * PLAYLIST_RESIZE_SEGMENT_WIDTH}px`
  };

  const classes = classnames("window", "draggable", {
    selected: focused === WINDOWS.PLAYLIST
  });

  return (
    <div
      id="playlist-window-shade"
      className={classes}
      style={{ width: style.width }}
      onMouseDown={focusPlaylist}
    >
      <div className="left">
        <div className="right draggable">
          <CharacterString id="playlist-shade-track-title">
            {name}
          </CharacterString>
          {/* TODO: Ellipisize */}
          <CharacterString id="playlist-shade-time">
            {getTimeStr(length)}
          </CharacterString>
          {/* TODO: Resize handle */}
          <div id="playlist-shade-button" onClick={toggleShade} />
          <div id="playlist-close-button" onClick={close} />
        </div>
      </div>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  focusPlaylist: () =>
    dispatch({ type: SET_FOCUSED_WINDOW, window: WINDOWS.PLAYLIST }),
  close: () => dispatch({ type: TOGGLE_PLAYLIST_WINDOW }),
  toggleShade: () => dispatch({ type: TOGGLE_PLAYLIST_SHADE_MODE })
});

const mapStateToProps = state => {
  const {
    windows: { focused },
    display: { skinPlaylistStyle, playlistSize, playlistShade },
    media: { length, name }
  } = state;
  return {
    focused,
    skinPlaylistStyle,
    playlistSize,
    playlistShade,
    trackOrder: getOrderedTracks(state),
    length,
    name
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistShade);
