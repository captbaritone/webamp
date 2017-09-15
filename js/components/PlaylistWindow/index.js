import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import MiniTime from "../MiniTime";
import { WINDOWS } from "../../constants";
import { SET_FOCUSED_WINDOW } from "../../actionTypes";
import { play, pause, stop, openFileDialog } from "../../actionCreators";

import "../../../css/playlist-window.css";

const PlaylistWindow = props => {
  const { skinPlaylistStyle, focusPlaylist, focused } = props;
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
      <div className="playlist-left">
        <div className="playlist-right">
          <div className="playlist-top title-bar draggable">
            <div className="playlist-top-left draggable" />
            <div className="playlist-top-title draggable" />
            <div className="playlist-top-right draggable">
              <div id="close-playlist" />
              <div id="shade-playlist" />
            </div>
          </div>
          {/* Eventual content lives here */}
          <div className="playlist-scrollbar" />
          <div className="playlist-bottom">
            <div className="playlist-bottom-left" />
            <div className="playlist-visualizer" />
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
  openFileDialog: () => dispatch(openFileDialog(ownProps.fileInput))
});

const mapStateToProps = state => {
  const { windows: { focused }, display: { skinPlaylistStyle } } = state;
  return { focused, skinPlaylistStyle };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistWindow);
