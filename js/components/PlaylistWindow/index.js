import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import Slider from "rc-slider/lib/Slider";

import DropTarget from "../DropTarget";
import MiniTime from "../MiniTime";
import PlaylistShade from "./PlaylistShade";
import Track from "./Track";
import AddMenu from "./AddMenu";
import RemoveMenu from "./RemoveMenu";
import SelectionMenu from "./SelectionMenu";
import MiscMenu from "./MiscMenu";
import ListMenu from "./ListMenu";
import ResizeTarget from "./ResizeTarget";
import RunningTimeDisplay from "./RunningTimeDisplay";
import { percentToIndex } from "../../utils";
import {
  WINDOWS,
  PLAYLIST_RESIZE_SEGMENT_WIDTH,
  PLAYLIST_RESIZE_SEGMENT_HEIGHT,
  MIN_PLAYLIST_WINDOW_WIDTH
} from "../../constants";
import {
  TOGGLE_PLAYLIST_WINDOW,
  TOGGLE_PLAYLIST_SHADE_MODE,
  SET_FOCUSED_WINDOW,
  SET_PLAYLIST_SCROLL_POSITION
} from "../../actionTypes";
import { getOrderedTracks } from "../../selectors";
import {
  play,
  pause,
  stop,
  openFileDialog,
  toggleVisualizerStyle
} from "../../actionCreators";

import "../../../css/playlist-window.css";

const TRACK_HEIGHT = 13;
const MIN_WINDOW_HEIGHT = 116;

const Handle = () => <div className="playlist-scrollbar-handle" />;

const PlaylistWindow = props => {
  const {
    skinPlaylistStyle,
    focusPlaylist,
    focused,
    playlistScrollPosition,
    setPlaylistScrollPosition,
    trackOrder,
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

  const BASE_WINDOW_HEIGHT = 52;
  const numberOfVisibleTracks = Math.floor(
    (BASE_WINDOW_HEIGHT + PLAYLIST_RESIZE_SEGMENT_HEIGHT * playlistSize[1]) /
      TRACK_HEIGHT
  );
  const overflowTracks = Math.max(0, trackOrder.length - numberOfVisibleTracks);
  const offset = percentToIndex(
    playlistScrollPosition / 100,
    overflowTracks + 1
  );

  // Ugh. By not rendering some tracks, we can end up in a situation where
  // scrolling causes the number of digits in the tracks to go up, thus causing
  // a horizontal jump.
  const tracks = trackOrder.slice(offset, offset + numberOfVisibleTracks);

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
          <div className="playlist-tracks">
            <div>
              {tracks.map((id, i) => (
                <Track number={i + 1 + offset} id={id} key={id} />
              ))}
            </div>
          </div>
        </div>
        <div className="playlist-middle-right draggable">
          <Slider
            className="playlist-scrollbar"
            type="range"
            min={0}
            max={100}
            step={1}
            value={playlistScrollPosition}
            onChange={setPlaylistScrollPosition}
            vertical
            handle={Handle}
            disabled={overflowTracks === 0}
          />
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
  setPlaylistScrollPosition: position =>
    dispatch({ type: SET_PLAYLIST_SCROLL_POSITION, position: 100 - position }),
  close: () => dispatch({ type: TOGGLE_PLAYLIST_WINDOW }),
  toggleShade: () => dispatch({ type: TOGGLE_PLAYLIST_SHADE_MODE }),
  toggleVisualizerStyle: () => dispatch(toggleVisualizerStyle())
});

const mapStateToProps = state => {
  const {
    windows: { focused },
    display: {
      skinPlaylistStyle,
      playlistScrollPosition,
      playlistSize,
      playlistShade
    },
    media: { duration }
  } = state;
  return {
    focused,
    skinPlaylistStyle,
    playlistScrollPosition,
    playlistSize,
    playlistShade,
    trackOrder: getOrderedTracks(state),
    duration
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistWindow);
