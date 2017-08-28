import React from "react";
import { connect } from "react-redux";
import WindowManager from "./WindowManager";
import MainWindow from "./MainWindow";
import PlaylistWindow from "./PlaylistWindow";
import EqualizerWindow from "./EqualizerWindow";
import Skin from "./Skin";
import { equalizerEnabled, playlistEnabled } from "../config";

const App = ({ winamp, loading }) =>
  loading ? (
    <div id="loading">
      Loading<span className="ellipsis-anim">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </div>
  ) : (
    <div id="loaded">
      <Skin>
        {/* This is not technically kosher, since <style> tags should be in
          the <head>, but browsers don't really care... */}
      </Skin>
      <WindowManager>
        <MainWindow fileInput={winamp.fileInput} mediaPlayer={winamp.media} />
        {equalizerEnabled && <EqualizerWindow fileInput={winamp.fileInput} />}
        {playlistEnabled && <PlaylistWindow />}
      </WindowManager>
    </div>
  );

const mapStateToProps = state => ({ loading: state.display.loading });

export default connect(mapStateToProps)(App);
