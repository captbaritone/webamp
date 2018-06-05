import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { objectMap } from "../utils";
import Emitter from "../emitter";
import { WINDOWS } from "../constants";
import ContextMenuWrapper from "./ContextMenuWrapper";
import MainContextMenu from "./MainWindow/MainContextMenu";
import WindowManager from "./WindowManager";
import MainWindow from "./MainWindow";
import PlaylistWindow from "./PlaylistWindow";
import EqualizerWindow from "./EqualizerWindow";
import GenWindow from "./GenWindow";
import Skin from "./Skin";

import "../../css/webamp.css";

/**
 * Constructs the windows to render, and tracks focus.
 */
class App extends React.Component {
  constructor() {
    super();
    this._emitter = new Emitter();
    this._windowNodes = {};
    this._bindings = {};
  }
  componentDidMount() {
    this._setFocus();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.focused !== this.props.focused) {
      this._setFocus();
    }
  }
  _setFocus() {
    const binding = this._bindings[this.props.focused];
    if (binding.node) {
      binding.node.focus();
    }
  }

  _gotRef(windowId, comp) {
    if (comp == null) {
      const binding = this._bindings[windowId];
      if (binding.remove) {
        binding.remove();
      }
      this._bindings[windowId] = null;
      return;
    }

    const node = ReactDOM.findDOMNode(comp);
    const binding = this._bindings[windowId];
    if (binding && binding.node === node) {
      return;
    }

    node.tabIndex = -1;
    const listener = e => this._emitter.trigger(windowId, e);
    node.addEventListener("keydown", listener);

    this._bindings[windowId] = {
      node,
      remove: () => {
        node.removeEventListener("keydown", listener);
      }
    };
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
        case WINDOWS.MAIN:
          return (
            <MainWindow
              ref={component => this._gotRef(id, component)}
              analyser={media.getAnalyser()}
              filePickers={filePickers}
            />
          );
        case WINDOWS.EQUALIZER:
          return (
            <EqualizerWindow ref={component => this._gotRef(id, component)} />
          );
        case WINDOWS.PLAYLIST:
          return (
            <PlaylistWindow
              ref={component => this._gotRef(id, component)}
              analyser={media.getAnalyser()}
            />
          );
        default:
          if (!w.generic) {
            throw new Error("Tried to render an unknown window:", id);
          }
          const Component = genWindowComponents[id];
          return (
            <GenWindow
              ref={component => this._gotRef(id, component)}
              title={w.title}
              windowId={id}
            >
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
