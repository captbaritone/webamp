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

const App = ({ media, closed, equalizer, playlist, openWindows }) => {
  if (closed) {
    return null;
  }
  const windows = {
    main: <MainWindow mediaPlayer={media} />,
    equalizer: equalizer && <EqualizerWindow />,
    playlist: playlist && <PlaylistWindow />
  };
  // Add any "generic" windows
  GEN_WINDOWS.forEach((windowId, i) => {
    const Component = genWindowMap[windowId];
    windows[`genWindow${i}`] = openWindows.has(windowId) && (
      <Component key={i} />
    );
  });
  return (
    <React.Fragment>
      <Skin />
      <WindowManager windows={windows} />
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  closed: state.display.closed,
  equalizer: state.windows.equalizer,
  playlist: state.windows.playlist,
  openWindows: new Set(state.windows.openGenWindows)
});

export default connect(mapStateToProps)(App);
