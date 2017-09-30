import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import Slider from "rc-slider/lib/Slider";

import MiniTime from "../MiniTime";
import Track from "./Track";
import { percentToIndex } from "../../utils";
import { WINDOWS } from "../../constants";
import {
  SET_FOCUSED_WINDOW,
  SET_PLAYLIST_SCROLL_POSITION
} from "../../actionTypes";
import { play, pause, stop, openFileDialog } from "../../actionCreators";

import "../../../css/playlist-window.css";

const TRACK_HEIGHT = 13;

const Handle = () => <div className="playlist-scrollbar-handle" />;

const PlaylistWindow = props => {
  const {
    skinPlaylistStyle,
    focusPlaylist,
    focused,
    playlistScrollPosition,
    setPlaylistScrollPosition
  } = props;
  const style = {
    color: skinPlaylistStyle.Normal,
    backgroundColor: skinPlaylistStyle.NormalBG,
    fontFamily: `${skinPlaylistStyle.Font}, Arial, sans-serif`
  };

  const classes = classnames("window", "draggable", {
    selected: focused === WINDOWS.PLAYLIST
  });

  const tracks = [
    ["Rock Is Dead", "Marilyn Manson", "191"],
    ["Spybreak! (Short One)", "Propellerheads", "191"],
    ["Bad Blood", "Ministry", "191"],
    ["Clubbed to Death", "Rob D", "191"],
    ["Prime Audio Soup", "Meat Beat Manifesto", "191"],
    ["Leave You Far Behind", "Lunatic Calm", "191"],
    ["Mindfields", "The Prodigy", "191"],
    ["Dragula", "Rob Zombie", "191"],
    ["My Own Summer (Shove It)", "Deftones", "191"],
    ["Ultrasonic Sound", "Hive", "191"],
    ["Look to Your Orb", "Monster Magnet", "191"],
    ["Du hast", "Rammstein", "191"],
    ["Wake Up", "Rage Against The Machine", "191"]
  ];

  const scrollTicks = tracks.length - 3;

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
              {tracks.map((track, i) => (
                <Track
                  number={i + 1}
                  title={`${track[0]} - ${track[1]}`}
                  duration={track[2]}
                  selected={i === 0}
                  current={i === 0}
                  key={i}
                />
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
        <div className="playlist-bottom-left draggable" />
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
    display: { skinPlaylistStyle, playlistScrollPosition }
  } = state;
  return { focused, skinPlaylistStyle, playlistScrollPosition };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistWindow);
