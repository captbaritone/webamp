import React from "react";
import { connect } from "react-redux";
import WindowManager from "./WindowManager";
import MainWindow from "./MainWindow";
import PlaylistWindow from "./PlaylistWindow";
import EqualizerWindow from "./EqualizerWindow";
import AvsWindow from "./AvsWindow";
import Skin from "./Skin";

import "../../css/winamp.css";

const genWindowMap = {
  AVS_WINDOW: AvsWindow
};

const GEN_WINDOWS = ["AVS_WINDOW"];

const App = ({ media, loading, closed, equalizer, playlist, openWindows }) => {
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
        <MainWindow mediaPlayer={media} />
        {equalizer && <EqualizerWindow />}
        {playlist && <PlaylistWindow />}
        {GEN_WINDOWS.map((windowId, i) => {
          const Component = genWindowMap[windowId];
          return openWindows.has(windowId) && <Component key={i} />;
        })}
      </WindowManager>
    </div>
  );
};

const mapStateToProps = state => ({
  loading: state.display.loading,
  closed: state.display.closed,
  equalizer: state.windows.equalizer,
  playlist: state.windows.playlist,
  openWindows: new Set(state.windows.openGenWindows)
});

export default connect(mapStateToProps)(App);
