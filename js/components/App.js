import React from "react";
import { connect } from "react-redux";
import WindowManager from "./WindowManager";
import MainWindow from "./MainWindow";
import PlaylistWindow from "./PlaylistWindow";
import EqualizerWindow from "./EqualizerWindow";
import Skin from "./Skin";
import { playlistEnabled } from "../config";

import "../../css/winamp.css";

const App = ({ media, fileInput, loading, closed, equalizer, playlist }) => {
  if (closed) {
    return null;
  }
  if (loading) {
    return (
      <div id="loading">
        Loading<span className="ellipsis-anim">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    );
  }
  return (
    <div id="loaded">
      <Skin />
      <WindowManager>
        <MainWindow fileInput={fileInput} mediaPlayer={media} />
        {equalizer && <EqualizerWindow fileInput={fileInput} />}
        {playlistEnabled &&
        playlist && <PlaylistWindow fileInput={fileInput} />}
      </WindowManager>
    </div>
  );
};

const mapStateToProps = state => ({
  loading: state.display.loading,
  closed: state.display.closed,
  equalizer: state.windows.equalizer,
  playlist: state.windows.playlist
});

export default connect(mapStateToProps)(App);
