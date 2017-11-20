import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import DropTarget from "../DropTarget";
import MiniTime from "../MiniTime";
import PlaylistShade from "./PlaylistShade";
import AddMenu from "./AddMenu";
import RemoveMenu from "./RemoveMenu";
import SelectionMenu from "./SelectionMenu";
import MiscMenu from "./MiscMenu";
import ListMenu from "./ListMenu";
import ResizeTarget from "./ResizeTarget";
import RunningTimeDisplay from "./RunningTimeDisplay";
import TrackList from "./TrackList";
import ScrollBar from "./ScrollBar";
import {
  WINDOWS,
  PLAYLIST_RESIZE_SEGMENT_WIDTH,
  PLAYLIST_RESIZE_SEGMENT_HEIGHT,
  MIN_PLAYLIST_WINDOW_WIDTH
} from "../../constants";
import {
  TOGGLE_PLAYLIST_WINDOW,
  TOGGLE_PLAYLIST_SHADE_MODE,
  SET_FOCUSED_WINDOW
} from "../../actionTypes";
import {
  play,
  pause,
  stop,
  openFileDialog,
  toggleVisualizerStyle,
  scrollUpFourTracks,
  scrollDownFourTracks
} from "../../actionCreators";

import "../../../css/playlist-window.css";

const MIN_WINDOW_HEIGHT = 116;

const PlaylistWindow = props => {
  const {
    skinPlaylistStyle,
    focusPlaylist,
    focused,
    playlistSize,
    playlistShade,
    close,
    toggleShade
  } = props;
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

  return (
    <DropTarget
      id="playlist-window"
      className={classes}
      style={style}
      onMouseDown={focusPlaylist}
    >
      <div className="playlist-top draggable">
        <div className="playlist-top-left draggable" />
        <div className="playlist-top-title draggable" />
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
          <AddMenu openFileDialog={props.openFileDialog} />
          <RemoveMenu />
          <SelectionMenu />
          <MiscMenu />
        </div>
        <div className="playlist-bottom-center draggable" />
        <div className="playlist-bottom-right draggable">
          <div
            className="playlist-visualizer"
            onClick={props.toggleVisualizerStyle}
          />
          <RunningTimeDisplay />
          <div className="playlist-action-buttons">
            <div className="playlist-previous-button" />
            <div className="playlist-play-button" onClick={props.play} />
            <div className="playlist-pause-button" onClick={props.pause} />
            <div className="playlist-stop-button" onClick={props.stop} />
            <div className="playlist-next-button" />
            <div
              className="playlist-eject-button"
              onClick={props.openFileDialog}
            />
          </div>
          <MiniTime />
          <ListMenu />
          <div
            id="playlist-scroll-up-button"
            onClick={props.scrollUpFourTracks}
          />
          <div
            id="playlist-scroll-down-button"
            onClick={props.scrollDownFourTracks}
          />
          <ResizeTarget />
        </div>
      </div>
    </DropTarget>
  );
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  focusPlaylist: () =>
    dispatch({
      type: SET_FOCUSED_WINDOW,
      window: WINDOWS.PLAYLIST
    }),
  play: () => dispatch(play()),
  pause: () => dispatch(pause()),
  stop: () => dispatch(stop()),
  openFileDialog: () => dispatch(openFileDialog(ownProps.fileInput)),
  close: () => dispatch({ type: TOGGLE_PLAYLIST_WINDOW }),
  toggleShade: () => dispatch({ type: TOGGLE_PLAYLIST_SHADE_MODE }),
  toggleVisualizerStyle: () => dispatch(toggleVisualizerStyle()),
  scrollUpFourTracks: () => dispatch(scrollUpFourTracks()),
  scrollDownFourTracks: () => dispatch(scrollDownFourTracks())
});

const mapStateToProps = state => {
  const {
    windows: { focused },
    display: { skinPlaylistStyle, playlistSize, playlistShade },
    media: { duration }
  } = state;

  return {
    focused,
    skinPlaylistStyle,
    playlistSize,
    playlistShade,
    duration
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistWindow);
