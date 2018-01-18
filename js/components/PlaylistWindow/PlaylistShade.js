import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { getOrderedTracks, getMinimalMediaText } from "../../selectors";
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
import PlaylistResizeTarget from "./PlaylistResizeTarget";

class PlaylistShade extends React.Component {
  _addedWidth() {
    return this.props.playlistSize[0] * PLAYLIST_RESIZE_SEGMENT_WIDTH;
  }
  _trimmedName() {
    const { name } = this.props;
    if (name == null) {
      return "[No file]";
    }

    const MIN_NAME_WIDTH = 205;

    const nameLength = (MIN_NAME_WIDTH + this._addedWidth()) / CHARACTER_WIDTH;
    return name.length > nameLength
      ? name.slice(0, nameLength - 1) + UTF8_ELLIPSIS
      : name;
  }

  _time() {
    const { length, name } = this.props;
    return name == null ? "" : getTimeStr(length);
  }

  render() {
    const { toggleShade, close, focusPlaylist, focused } = this.props;

    const style = {
      width: `${MIN_PLAYLIST_WINDOW_WIDTH + this._addedWidth()}px`
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
        onDoubleClick={toggleShade}
      >
        <div className="left">
          <div className="right draggable">
            <CharacterString id="playlist-shade-track-title">
              {this._trimmedName()}
            </CharacterString>
            <CharacterString id="playlist-shade-time">
              {this._time()}
            </CharacterString>
            <PlaylistResizeTarget widthOnly />
            <div id="playlist-shade-button" onClick={toggleShade} />
            <div id="playlist-close-button" onClick={close} />
          </div>
        </div>
      </div>
    );
  }
}

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
    name: getMinimalMediaText(state)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistShade);
