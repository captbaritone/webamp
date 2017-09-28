import React from "react";
import { connect } from "react-redux";
import WindowManager from "./WindowManager";
import MainWindow from "./MainWindow";
import PlaylistWindow from "./PlaylistWindow";
import EqualizerWindow from "./EqualizerWindow";
import Skin from "./Skin";
import { playlistEnabled } from "../config";

const App = ({ winamp, loading, closed, equalizer, playlist }) => {
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
      <Skin>
        {/* This is not technically kosher, since <style> tags should be in
          the <head>, but browsers don't really care... */}
      </Skin>
      <WindowManager>
        <MainWindow fileInput={winamp.fileInput} mediaPlayer={winamp.media} />
        {equalizer && <EqualizerWindow fileInput={winamp.fileInput} />}
        {playlistEnabled &&
        playlist && <PlaylistWindow fileInput={winamp.fileInput} />}
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
