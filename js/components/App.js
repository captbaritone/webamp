import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { objectMap } from "../utils";
import Emitter from "../emitter";
import ContextMenuWrapper from "./ContextMenuWrapper";
import MainContextMenu from "./MainWindow/MainContextMenu";
import WindowManager from "./WindowManager";
import MainWindow from "./MainWindow";
import PlaylistWindow from "./PlaylistWindow";
import EqualizerWindow from "./EqualizerWindow";
import GenWindow from "./GenWindow";
import Skin from "./Skin";

import "../../css/webamp.css";

class App extends React.Component {
  constructor() {
    super();
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._emitter = new Emitter();
  }

  componentDidMount() {
    document.addEventListener("keydown", this._handleKeyDown);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this._handleKeyDown);
  }
  _handleKeyDown(e) {
    this._emitter.trigger(this.props.focused, e);
  }
  _renderWindows() {
    const {
      media,
      genWindowsInfo,
      filePickers,
      genWindowComponents
    } = this.props;
    return objectMap(genWindowsInfo, (w, id) => {
      if (!w.open) {
        return null;
      }
      switch (id) {
        case "main":
          return (
            <MainWindow
              analyser={media.getAnalyser()}
              filePickers={filePickers}
            />
          );
        case "equalizer":
          return <EqualizerWindow />;
        case "playlist":
          return <PlaylistWindow analyser={media.getAnalyser()} />;
        default:
          if (!w.generic) {
            throw new Error("Tried to render an unknown window:", id);
          }
          const Component = genWindowComponents[id];
          return (
            <GenWindow title={w.title} windowId={id}>
              {({ height, width }) => (
                <Component
                  onFocusedKeyDown={listener => this._emitter.on(id, listener)}
                  analyser={media.getAnalyser()}
                  width={width}
                  height={height}
                />
              )}
            </GenWindow>
          );
      }
    });
  }
  render() {
    const { closed, container, filePickers } = this.props;
    if (closed) {
      return null;
    }
    return (
      <div role="application" id="webamp">
        <Skin />
        <ContextMenuWrapper
          renderContents={() => <MainContextMenu filePickers={filePickers} />}
        >
          <WindowManager
            windows={this._renderWindows()}
            container={container}
          />
        </ContextMenuWrapper>
      </div>
    );
  }
}

App.propTypes = {
  container: PropTypes.instanceOf(Element)
};

const mapStateToProps = state => ({
  focused: state.windows.focused,
  closed: state.display.closed,
  genWindowsInfo: state.windows.genWindows
});

export default connect(mapStateToProps)(App);
