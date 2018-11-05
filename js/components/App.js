import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Emitter from "../emitter";
import { WINDOWS, MEDIA_STATUS } from "../constants";
import * as Selectors from "../selectors";
import * as Actions from "../actionCreators";
import * as Utils from "../utils";
import MilkdropWindow from "../components/MilkdropWindow";
import ContextMenuWrapper from "./ContextMenuWrapper";
import MainContextMenu from "./MainWindow/MainContextMenu";
import WindowManager from "./WindowManager";
import MainWindow from "./MainWindow";
import PlaylistWindow from "./PlaylistWindow";
import EqualizerWindow from "./EqualizerWindow";
import MediaLibraryWindow from "./MediaLibraryWindow";
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

  componentWillMount() {
    this._webampNode = document.createElement("div");
    this._webampNode.id = "webamp";
    this._webampNode.role = "application";
    this._webampNode.style.zIndex = this.props.zIndex;
    document.body.appendChild(this._webampNode);

    this.props.browserWindowSizeChanged(Utils.getWindowSize());
    window.addEventListener("resize", this._handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._handleWindowResize);
    document.body.removeChild(this._webampNode);
  }

  componentDidMount() {
    this._setFocus();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.focused !== this.props.focused) {
      this._setFocus();
    }
  }

  _handleWindowResize = () => {
    if (this._webampNode == null) {
      return;
    }
    // It's a bit tricky to measure the "natural" size of the browser window.
    // Specifically we want to know how large the window would be without our
    // own Webamp windows influencing it. To achieve this, we temporarily make
    // our container `overflow: hidden;`. We then make our container full
    // screen by setting the bottom/right properties to zero. This second part
    // allows our Webamp windows to stay visible during the resize. After we
    // measure, we set the style back so that we don't end up interfering with
    // click events outside of our Webamp windows.
    this._webampNode.style.right = 0;
    this._webampNode.style.bottom = 0;
    this._webampNode.style.overflow = "hidden";
    this.props.browserWindowSizeChanged(Utils.getWindowSize());
    this._webampNode.style.right = null;
    this._webampNode.style.bottom = null;
    this._webampNode.style.overflow = "visible";
  };

  _setFocus() {
    const binding = this._bindings[this.props.focused];
    if (binding && binding.node) {
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
    return Utils.objectMap(genWindowsInfo, (w, id) => {
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
        case WINDOWS.MEDIA_LIBRARY:
          return (
            <MediaLibraryWindow
              ref={component => this._gotRef(id, component)}
            />
          );
        case WINDOWS.MILKDROP:
          return (
            <MilkdropWindow
              ref={component => this._gotRef(id, component)}
              options={this.props.butterchurnOptions}
              onFocusedKeyDown={listener => this._emitter.on(id, listener)}
              analyser={media.getAnalyser()}
            />
          );
        default:
          if (!w.generic) {
            throw new Error("Tried to render an unknown window:", id);
          }
          const Component = genWindowComponents[id];
          return (
            <Component
              ref={component => this._gotRef(id, component)}
              title={w.title}
              windowId={id}
              onFocusedKeyDown={listener => this._emitter.on(id, listener)}
              analyser={media.getAnalyser()}
              isEnabledVisualizer={this.props.visualizerStyle === id}
              playing={this.props.status === MEDIA_STATUS.PLAYING}
              close={() => this.props.closeWindow(id)}
            />
          );
      }
    });
  }

  render() {
    const { closed, container, filePickers } = this.props;
    if (closed) {
      return null;
    }
    return ReactDOM.createPortal(
      <React.Fragment>
        <Skin />
        <ContextMenuWrapper
          renderContents={() => <MainContextMenu filePickers={filePickers} />}
        >
          <WindowManager
            windows={this._renderWindows()}
            container={container}
          />
        </ContextMenuWrapper>
      </React.Fragment>,
      this._webampNode
    );
  }
}

App.propTypes = {
  container: PropTypes.instanceOf(Element)
};

const mapStateToProps = state => ({
  visualizerStyle: Selectors.getVisualizerStyle(state),
  status: state.media.status,
  focused: state.windows.focused,
  closed: state.display.closed,
  genWindowsInfo: state.windows.genWindows,
  zIndex: state.display.zIndex
});

const mapDispatchToProps = dispatch => ({
  closeWindow: id => dispatch(Actions.closeWindow(id)),
  browserWindowSizeChanged: size =>
    dispatch(Actions.browserWindowSizeChanged(size))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
