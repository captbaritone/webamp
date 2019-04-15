import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import Emitter from "../emitter";
import {
  WindowId,
  AppState,
  Dispatch,
  Size,
  MediaStatus,
  FilePicker,
} from "../types";
import { WINDOWS } from "../constants";
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
import { WebampWindow } from "../reducers/windows";
import Media from "../media";

interface StateProps {
  visualizerStyle: string;
  status: MediaStatus;
  focused: WindowId;
  closed: boolean;
  // TODO: Get only the info we really need
  genWindowsInfo: { [windowId: string]: WebampWindow };
  zIndex: number;
}

interface DispatchProps {
  closeWindow(id: WindowId): void;
  browserWindowSizeChanged(size: Size): void;
}

interface OwnProps {
  container: HTMLElement;
  filePickers: FilePicker[];
  media: Media;
}

type Props = StateProps & DispatchProps & OwnProps;

/**
 * Constructs the windows to render, and tracks focus.
 */
class App extends React.Component<Props> {
  _webampNode: HTMLDivElement | null;
  constructor(props: Props) {
    super(props);
    this._webampNode = null;
  }

  componentWillMount() {
    this._webampNode = document.createElement("div");
    this._webampNode.id = "webamp";
    // @ts-ignore I think I'm supposed to set this with setAttribute, but I can't confirm.
    this._webampNode.role = "application";
    this._webampNode.style.zIndex = String(this.props.zIndex);
    document.body.appendChild(this._webampNode);

    this.props.browserWindowSizeChanged(Utils.getWindowSize());
    window.addEventListener("resize", this._handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._handleWindowResize);
    const webampNode = this._webampNode;
    if (webampNode == null) {
      return;
    }
    const parentNode = webampNode.parentNode;
    if (parentNode != null) {
      parentNode.removeChild(webampNode!);
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
    this._webampNode.style.right = "0";
    this._webampNode.style.bottom = "0";
    this._webampNode.style.overflow = "hidden";
    this.props.browserWindowSizeChanged(Utils.getWindowSize());
    this._webampNode.style.right = null;
    this._webampNode.style.bottom = null;
    this._webampNode.style.overflow = "visible";
  };

  _renderWindows() {
    const { media, genWindowsInfo, filePickers } = this.props;
    return Utils.objectMap(genWindowsInfo, (w, id) => {
      if (!w.open) {
        return null;
      }
      switch (id) {
        case WINDOWS.MAIN:
          return (
            <MainWindow
              analyser={media.getAnalyser()}
              filePickers={filePickers}
            />
          );
        case WINDOWS.EQUALIZER:
          return <EqualizerWindow />;
        case WINDOWS.PLAYLIST:
          return <PlaylistWindow analyser={media.getAnalyser()} />;
        case WINDOWS.MEDIA_LIBRARY:
          return <MediaLibraryWindow />;
        case WINDOWS.MILKDROP:
          return <MilkdropWindow analyser={media.getAnalyser()} />;
        default:
          throw new Error(`Tried to render an unknown window: ${id}`);
      }
    });
  }

  render() {
    const { closed, container, filePickers } = this.props;
    if (closed || this._webampNode == null) {
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

const mapStateToProps = (state: AppState): StateProps => {
  return {
    visualizerStyle: Selectors.getVisualizerStyle(state),
    status: state.media.status,
    focused: state.windows.focused,
    closed: state.display.closed,
    genWindowsInfo: state.windows.genWindows,
    zIndex: state.display.zIndex,
  };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    closeWindow: (id: WindowId) => dispatch(Actions.closeWindow(id)),
    browserWindowSizeChanged: (size: Size) =>
      dispatch(Actions.browserWindowSizeChanged(size)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
