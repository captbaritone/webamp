import React, {
  useLayoutEffect,
  useEffect,
  useState,
  useCallback,
} from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
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
import Skin from "./Skin";

import "../../css/webamp.css";
import { WebampWindow } from "../reducers/windows";
import Media from "../media";

interface StateProps {
  visualizerStyle: string;
  status: MediaStatus;
  closed: boolean;
  // TODO: Get only the info we really need
  genWindowsInfo: { [windowId: string]: WebampWindow };
  zIndex: number;
}

interface DispatchProps {
  closeWindow(id: WindowId): void;
  browserWindowSizeChanged(size: Size): void;
  clearFocus(): void;
}

interface OwnProps {
  container: HTMLElement;
  filePickers: FilePicker[];
  media: Media;
}

type Props = StateProps & DispatchProps & OwnProps;

/**
 * Constructs the windows to render
 */
function App({
  zIndex,
  browserWindowSizeChanged,
  closed,
  container,
  clearFocus,
  media,
  genWindowsInfo,
  filePickers,
}: Props) {
  const [webampNode] = useState(() => {
    const node = document.createElement("div");
    node.id = "webamp";
    // @ts-ignore I think I'm supposed to set this with setAttribute, but I can't confirm.
    node.role = "application";
    return node;
  });

  useLayoutEffect(() => {
    webampNode.style.zIndex = String(zIndex);
  }, [webampNode, zIndex]);

  useLayoutEffect(() => {
    document.body.appendChild(webampNode);
    return () => {
      document.body.removeChild(webampNode);
    };
  }, [webampNode]);

  useEffect(() => {
    const handleWindowResize = () => {
      if (webampNode == null) {
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
      webampNode.style.right = "0";
      webampNode.style.bottom = "0";
      webampNode.style.overflow = "hidden";
      browserWindowSizeChanged(Utils.getWindowSize());
      webampNode.style.right = "auto";
      webampNode.style.bottom = "auto";
      webampNode.style.overflow = "visible";
    };

    handleWindowResize();

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [browserWindowSizeChanged, webampNode]);

  const renderWindows = useCallback(() => {
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
        case WINDOWS.MILKDROP:
          return <MilkdropWindow analyser={media.getAnalyser()} />;
        default:
          throw new Error(`Tried to render an unknown window: ${id}`);
      }
    });
  }, [media, filePickers, genWindowsInfo]);

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Element)) {
      clearFocus();
    }
  };

  if (closed) {
    return null;
  }

  return ReactDOM.createPortal(
    <React.StrictMode>
      <div onBlur={handleBlur}>
        <Skin />
        <ContextMenuWrapper
          renderContents={() => <MainContextMenu filePickers={filePickers} />}
        >
          <WindowManager windows={renderWindows()} container={container} />
        </ContextMenuWrapper>
      </div>
    </React.StrictMode>,
    webampNode
  );
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    visualizerStyle: Selectors.getVisualizerStyle(state),
    status: state.media.status,
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
    clearFocus: () => dispatch(Actions.setFocusedWindow(null)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
