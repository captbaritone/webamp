import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import Slider from "rc-slider/lib/Slider";

import MiniTime from "../MiniTime";
import { WINDOWS } from "../../constants";
import {
  SET_FOCUSED_WINDOW,
  SET_PLAYLIST_SCROLL_POSITION
} from "../../actionTypes";
import { play, pause, stop, openFileDialog } from "../../actionCreators";

import "../../../css/playlist-window.css";

const Handle = () => <div className="playlist-scrollbar-handle" />;

const PlaylistWindow = props => {
  const {
    skinPlaylistStyle,
    focusPlaylist,
    focused,
    playlistScrollPosition,
    setPlaylistScrollPosition
  } = props;
  const style = {};
  if (props) {
    style.color = skinPlaylistStyle.Normal;
    style.backgroundColor = skinPlaylistStyle.NormalBG;
  }

  const classes = classnames("window", "draggable", {
    selected: focused === WINDOWS.PLAYLIST
  });
  return (
    <div
      id="playlist-window"
      className={classes}
      style={style}
      onMouseDown={focusPlaylist}
    >
      <div className="playlist-top">
        <div className="playlist-top-left" />
        <div className="playlist-top-title" />
        <div className="playlist-top-right" />
      </div>
      <div className="playlist-middle">
        <div className="playlist-middle-left" />
        <div className="playlist-middle-center" />
        <div className="playlist-middle-right">
          <Slider
            className="playlist-scrollbar"
            type="range"
            min={0}
            max={100}
            step={1}
            value={100 - playlistScrollPosition}
            onChange={setPlaylistScrollPosition}
            vertical
            handle={Handle}
          />
        </div>
      </div>
      <div className="playlist-bottom">
        <div className="playlist-bottom-left" />
        <div className="playlist-bottom-center" />
        <div className="playlist-bottom-right">
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
    dispatch({ type: SET_PLAYLIST_SCROLL_POSITION, position })
});

const mapStateToProps = state => {
  const {
    windows: { focused },
    display: { skinPlaylistStyle, playlistScrollPosition }
  } = state;
  return { focused, skinPlaylistStyle, playlistScrollPosition };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistWindow);
