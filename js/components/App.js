import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import WindowManager from "./WindowManager";
import MainWindow from "./MainWindow";
import PlaylistWindow from "./PlaylistWindow";
import EqualizerWindow from "./EqualizerWindow";
import GenWindow from "./GenWindow";
import Skin from "./Skin";

import "../../css/webamp.css";

const App = ({
  media,
  closed,
  equalizer,
  playlist,
  openWindows,
  container,
  filePickers,
  genWindows = {}
}) => {
  if (closed) {
    return null;
  }
  const windows = {
    main: <MainWindow mediaPlayer={media} filePickers={filePickers} />,
    equalizer: equalizer && <EqualizerWindow />,
    playlist: playlist && <PlaylistWindow />
  };
  // Add any "generic" windows
  Object.keys(genWindows).forEach((windowId, i) => {
    const windowInfo = genWindows[windowId];
    const { title, Component } = windowInfo;
    windows[`genWindow${i}`] = openWindows.has(windowId) && (
      <GenWindow
        key={i}
        title={title}
        close={() => {
          // TODO: Allow windows to close
        }}
        windowId={windowId}
      >
        {({ height, width }) => (
          <Component analyser={media._analyser} width={width} height={height} />
        )}
      </GenWindow>
    );
  });
  return (
    <div role="application" id="webamp">
      <Skin />
      <WindowManager windows={windows} container={container} />
    </div>
  );
};

App.propTypes = {
  container: PropTypes.instanceOf(Element)
};

const mapStateToProps = state => ({
  closed: state.display.closed,
  equalizer: state.windows.equalizer,
  playlist: state.windows.playlist,
  openWindows: new Set(state.windows.openGenWindows)
});

export default connect(mapStateToProps)(App);
