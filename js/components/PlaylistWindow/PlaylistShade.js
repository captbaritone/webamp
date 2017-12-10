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
  MIN_PLAYLIST_WINDOW_WIDTH,
  CHARACTER_WIDTH,
  UTF8_ELLIPSIS
} from "../../constants";
import CharacterString from "../CharacterString";
import ResizeTarget from "./ResizeTarget";

import { getOrderedTracks, getMediaText } from "../../selectors";

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

  const addedWidth = playlistSize[0] * PLAYLIST_RESIZE_SEGMENT_WIDTH;
  const style = {
    width: `${MIN_PLAYLIST_WINDOW_WIDTH + addedWidth}px`
  };
  const MIN_NAME_WIDTH = 205;

  const nameLength = (MIN_NAME_WIDTH + addedWidth) / CHARACTER_WIDTH;
  const trimmedName =
    name.length > nameLength
      ? name.slice(0, nameLength - 1) + UTF8_ELLIPSIS
      : name;

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
            {trimmedName}
          </CharacterString>
          {/* TODO: Ellipisize */}
          <CharacterString id="playlist-shade-time">
            {getTimeStr(length)}
          </CharacterString>
          <ResizeTarget widthOnly />
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
    media: { length }
  } = state;
  return {
    focused,
    skinPlaylistStyle,
    playlistSize,
    playlistShade,
    trackOrder: getOrderedTracks(state),
    length,
    name: getMediaText(state)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistShade);
