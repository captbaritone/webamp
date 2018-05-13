import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { objectMap } from "../utils";
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
  genWindowsInfo,
  container,
  filePickers,
  genWindowComponents
}) => {
  if (closed) {
    return null;
  }

  const windows = objectMap(genWindowsInfo, (w, id) => {
    if (!w.open) {
      return null;
    }
    switch (id) {
      case "main":
        return <MainWindow mediaPlayer={media} filePickers={filePickers} />;
      case "equalizer":
        return <EqualizerWindow />;
      case "playlist":
        return <PlaylistWindow />;
      default:
        if (!w.generic) {
          throw new Error("Tried to render an unknown window:", id);
        }
        const Component = genWindowComponents[id];
        return (
          <GenWindow title={w.title} windowId={id}>
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
      <ContextMenuWrapper
        renderContents={() => <MainContextMenu filePickers={filePickers} />}
      >
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
  genWindowsInfo: state.windows.genWindows
});

export default connect(mapStateToProps)(App);
