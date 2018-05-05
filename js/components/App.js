import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ContextMenuWrapper from "./ContextMenuWrapper";
import MainContextMenu from "./MainWindow/MainContextMenu";
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
  mainWindow,
  equalizer,
  playlist,
  genWindowsInfo,
  container,
  filePickers,
  genWindows = []
}) => {
  if (closed) {
    return null;
  }
  const windows = {
    main: mainWindow && (
      <MainWindow mediaPlayer={media} filePickers={filePickers} />
    ),
    equalizer: equalizer && <EqualizerWindow />,
    playlist: playlist && <PlaylistWindow />
  };
  // Add any "generic" windows
  genWindows.forEach(genWindow => {
    const { id, title, Component } = genWindow;
    if (genWindowsInfo[id].open) {
      windows[id] = (
        <GenWindow key={id} title={title} windowId={id}>
          {({ height, width }) => (
            <Component
              analyser={media._analyser}
              width={width}
              height={height}
            />
          )}
        </GenWindow>
      );
    }
  });
  return (
    <div role="application" id="webamp">
      <Skin />
      <ContextMenuWrapper Contents={MainContextMenu}>
        <WindowManager windows={windows} container={container} />
      </ContextMenuWrapper>
    </div>
  );
};

App.propTypes = {
  container: PropTypes.instanceOf(Element)
};

const mapStateToProps = state => ({
  closed: state.display.closed,
  mainWindow: state.windows.mainWindow,
  equalizer: state.windows.equalizer,
  playlist: state.windows.playlist,
  genWindowsInfo: state.windows.genWindows
});

export default connect(mapStateToProps)(App);
