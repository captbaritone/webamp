import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import {
  WINDOWS,
  PLAYLIST_RESIZE_SEGMENT_WIDTH,
  PLAYLIST_RESIZE_SEGMENT_HEIGHT,
  MIN_PLAYLIST_WINDOW_WIDTH,
  TRACK_HEIGHT
} from "../../constants";
import {
  TOGGLE_PLAYLIST_WINDOW,
  TOGGLE_PLAYLIST_SHADE_MODE,
  SET_FOCUSED_WINDOW
} from "../../actionTypes";
import {
  toggleVisualizerStyle,
  scrollUpFourTracks,
  scrollDownFourTracks,
  loadFilesFromReferences,
  togglePlaylistShadeMode,
  scrollVolume
} from "../../actionCreators";
import { getScrollOffset } from "../../selectors";

import { clamp } from "../../utils";
import DropTarget from "../DropTarget";
import PlaylistShade from "./PlaylistShade";
import AddMenu from "./AddMenu";
import RemoveMenu from "./RemoveMenu";
import SelectionMenu from "./SelectionMenu";
import MiscMenu from "./MiscMenu";
import ListMenu from "./ListMenu";
import PlaylistResizeTarget from "./PlaylistResizeTarget";
import PlaylistActionArea from "./PlaylistActionArea";
import TrackList from "./TrackList";
import ScrollBar from "./ScrollBar";

import "../../../css/playlist-window.css";

const MIN_WINDOW_HEIGHT = 116;

class PlaylistWindow extends React.Component {
  constructor(props) {
    super(props);
    this._handleDrop = this._handleDrop.bind(this);
  }

  _handleDrop(e, targetCoords) {
    const top = e.clientY - targetCoords.y;
    const atIndex = clamp(
      this.props.offset + Math.round((top - 23) / TRACK_HEIGHT),
      0,
      this.props.maxTrackIndex + 1
    );
    this.props.loadFilesFromReferences(e, atIndex);
  }

  render() {
    const {
      skinPlaylistStyle,
      focusPlaylist,
      focused,
      playlistSize,
      playlistShade,
      close,
      toggleShade
    } = this.props;
    if (playlistShade) {
      return <PlaylistShade />;
    }

    const style = {
      color: skinPlaylistStyle.normal,
      backgroundColor: skinPlaylistStyle.normalbg,
      fontFamily: `${skinPlaylistStyle.font}, Arial, sans-serif`,
      height: `${MIN_WINDOW_HEIGHT +
        playlistSize[1] * PLAYLIST_RESIZE_SEGMENT_HEIGHT}px`,
      width: `${MIN_PLAYLIST_WINDOW_WIDTH +
        playlistSize[0] * PLAYLIST_RESIZE_SEGMENT_WIDTH}px`
    };

    const classes = classnames("window", "draggable", {
      selected: focused === WINDOWS.PLAYLIST,
      wide: playlistSize[0] > 2
    });

    const showSpacers = playlistSize[0] % 2 === 0;

    return (
      <DropTarget
        id="playlist-window"
        className={classes}
        style={style}
        onMouseDown={focusPlaylist}
        handleDrop={this._handleDrop}
        onWheel={this.props.scrollVolume}
      >
        <div
          className="playlist-top draggable"
          onDoubleClick={this.props.togglePlaylistShadeMode}
        >
          <div className="playlist-top-left draggable" />
          {showSpacers && (
            <div className="playlist-top-left-spacer draggable" />
          )}
          <div className="playlist-top-left-fill draggable" />
          <div className="playlist-top-title draggable" />
          {showSpacers && (
            <div className="playlist-top-right-spacer draggable" />
          )}
          <div className="playlist-top-right-fill draggable" />
          <div className="playlist-top-right draggable">
            <div id="playlist-shade-button" onClick={toggleShade} />
            <div id="playlist-close-button" onClick={close} />
          </div>
        </div>
        <div className="playlist-middle draggable">
          <div className="playlist-middle-left draggable" />
          <div className="playlist-middle-center">
            <TrackList />
          </div>
          <div className="playlist-middle-right draggable">
            <ScrollBar />
          </div>
        </div>
        <div className="playlist-bottom draggable">
          <div className="playlist-bottom-left draggable">
            <AddMenu />
            <RemoveMenu />
            <SelectionMenu />
            <MiscMenu />
          </div>
          <div className="playlist-bottom-center draggable" />
          <div className="playlist-bottom-right draggable">
            <div
              className="playlist-visualizer"
              onClick={this.props.toggleVisualizerStyle}
            />
            <PlaylistActionArea />
            <ListMenu />
            <div
              id="playlist-scroll-up-button"
              onClick={this.props.scrollUpFourTracks}
            />
            <div
              id="playlist-scroll-down-button"
              onClick={this.props.scrollDownFourTracks}
            />
            <PlaylistResizeTarget />
          </div>
        </div>
      </DropTarget>
    );
  }
}

const mapDispatchToProps = {
  focusPlaylist: () => ({
    type: SET_FOCUSED_WINDOW,
    window: WINDOWS.PLAYLIST
  }),
  close: () => ({ type: TOGGLE_PLAYLIST_WINDOW }),
  toggleShade: () => ({ type: TOGGLE_PLAYLIST_SHADE_MODE }),
  toggleVisualizerStyle,
  scrollUpFourTracks,
  scrollDownFourTracks,
  loadFilesFromReferences: (e, startIndex) =>
    loadFilesFromReferences(e.dataTransfer.files, null, startIndex),
  togglePlaylistShadeMode,
  scrollVolume
};

const mapStateToProps = state => {
  const {
    windows: { focused },
    display: { skinPlaylistStyle, playlistSize, playlistShade },
    media: { duration },
    playlist: { trackOrder }
  } = state;

  return {
    offset: getScrollOffset(state),
    maxTrackIndex: trackOrder.length - 1,
    focused,
    skinPlaylistStyle,
    playlistSize,
    playlistShade,
    duration
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistWindow);
