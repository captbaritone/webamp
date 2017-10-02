import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import Slider from "rc-slider/lib/Slider";

import MiniTime from "../MiniTime";
import Track from "./Track";
import SelectionMenu from "./SelectionMenu";
import ResizeTarget from "./ResizeTarget";
import { percentToIndex } from "../../utils";
import {
  WINDOWS,
  PLAYLIST_RESIZE_SEGMENT_WIDTH,
  PLAYLIST_RESIZE_SEGMENT_HEIGHT
} from "../../constants";
import {
  SET_FOCUSED_WINDOW,
  SET_PLAYLIST_SCROLL_POSITION
} from "../../actionTypes";
import { play, pause, stop, openFileDialog } from "../../actionCreators";

import "../../../css/playlist-window.css";

const TRACK_HEIGHT = 13;
const MIN_WINDOW_HEIGHT = 116;
const MIN_WINDOW_WIDTH = 275;

const Handle = () => <div className="playlist-scrollbar-handle" />;

const PlaylistWindow = props => {
  const {
    skinPlaylistStyle,
    focusPlaylist,
    focused,
    playlistScrollPosition,
    setPlaylistScrollPosition,
    trackOrder,
    playlistSize
  } = props;

  const style = {
    color: skinPlaylistStyle.Normal,
    backgroundColor: skinPlaylistStyle.NormalBG,
    fontFamily: `${skinPlaylistStyle.Font}, Arial, sans-serif`,
    height: `${MIN_WINDOW_HEIGHT +
      playlistSize[1] * PLAYLIST_RESIZE_SEGMENT_HEIGHT}px`,
    width: `${MIN_WINDOW_WIDTH +
      playlistSize[0] * PLAYLIST_RESIZE_SEGMENT_WIDTH}px`
  };

  const classes = classnames("window", "draggable", {
    selected: focused === WINDOWS.PLAYLIST
  });

  // TODO: This magic number will need to change if the playlist is resized.
  const scrollTicks = trackOrder.length - 3;

  const offset =
    percentToIndex(playlistScrollPosition / 100, scrollTicks) * TRACK_HEIGHT;
  return (
    <div
      id="playlist-window"
      className={classes}
      style={style}
      onMouseDown={focusPlaylist}
    >
      <div className="playlist-top draggable">
        <div className="playlist-top-left draggable" />
        <div className="playlist-top-title draggable" />
        <div className="playlist-top-right draggable" />
      </div>
      <div className="playlist-middle draggable">
        <div className="playlist-middle-left draggable" />
        <div className="playlist-middle-center">
          <div className="playlist-tracks">
            <div style={{ marginTop: `-${offset}px` }}>
              {trackOrder.map((id, i) => (
                <Track number={i + 1} id={id} key={id} />
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
          />
        </div>
      </div>
      <div className="playlist-bottom draggable">
        <div className="playlist-bottom-left draggable">
          <SelectionMenu />
        </div>
        <div className="playlist-bottom-center draggable" />
        <div className="playlist-bottom-right draggable">
          <div className="playlist-action-buttons">
            <div className="playlist-previous-button" />
            <div className="playlist-play-button" onClick={props.play} />
            <div className="playlist-pause-button" onClick={props.pause} />
            <div className="playlist-stop-button" onClick={props.stop} />
            <div className="playlist-next-butto" />
            <div
              className="playlist-eject-button"
              onClick={props.openFileDialog}
            />
          </div>
          <MiniTime />
          <ResizeTarget />
        </div>
      </div>
    </div>
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
    dispatch({ type: SET_PLAYLIST_SCROLL_POSITION, position: 100 - position })
});

const mapStateToProps = state => {
  const {
    windows: { focused },
    display: { skinPlaylistStyle, playlistScrollPosition, playlistSize },
    playlist: { trackOrder }
  } = state;
  return {
    focused,
    skinPlaylistStyle,
    playlistScrollPosition,
    playlistSize,
    trackOrder
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistWindow);
