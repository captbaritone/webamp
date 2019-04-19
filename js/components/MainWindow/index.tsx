import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { WINDOWS, MEDIA_STATUS } from "../../constants";
import {
  loadFilesFromReferences,
  toggleMainWindowShadeMode,
  scrollVolume,
  loadMedia,
} from "../../actionCreators";
import { getWindowShade } from "../../selectors";

import DropTarget from "../DropTarget";
import MiniTime from "../MiniTime";

import ClickedDiv from "../ClickedDiv";
import ContextMenuTarget from "../ContextMenuTarget";
import Visualizer from "../Visualizer";
import ActionButtons from "./ActionButtons";
import MainBalance from "./MainBalance";
import Close from "./Close";
import ClutterBar from "./ClutterBar";
import MainContextMenu from "./MainContextMenu";
import Eject from "./Eject";
import EqToggleButton from "./EqToggleButton";
import PlaylistToggleButton from "./PlaylistToggleButton";
import Kbps from "./Kbps";
import Khz from "./Khz";
import Marquee from "./Marquee";
import MonoStereo from "./MonoStereo";
import Position from "./Position";
import Repeat from "./Repeat";
import Shade from "./Shade";
import Minimize from "./Minimize";
import Shuffle from "./Shuffle";
import Time from "./Time";
import MainVolume from "./MainVolume";

import "../../../css/main-window.css";
import {
  MediaStatus,
  WindowId,
  AppState,
  Dispatch,
  FilePicker,
} from "../../types";
import FocusTarget from "../FocusTarget";

interface StateProps {
  focused: WindowId | null;
  loading: boolean;
  doubled: boolean;
  mainShade: boolean;
  llama: boolean;
  working: boolean;
  status: MediaStatus | null;
}

interface DispatchProps {
  loadFilesFromReferences(files: FileList): void;
  scrollVolume(e: React.WheelEvent<HTMLDivElement>): void;
  toggleMainWindowShadeMode(): void;
  loadMedia(e: React.DragEvent<HTMLDivElement>): void;
}

interface OwnProps {
  analyser: AnalyserNode;
  filePickers: FilePicker[];
}

type Props = StateProps & DispatchProps & OwnProps;

export class MainWindow extends React.Component<Props> {
  render() {
    const {
      focused,
      loading,
      doubled,
      mainShade,
      llama,
      status,
      working,
      filePickers,
    } = this.props;

    const className = classnames({
      window: true,
      play: status === MEDIA_STATUS.PLAYING,
      stop: status === MEDIA_STATUS.STOPPED,
      pause: status === MEDIA_STATUS.PAUSED,
      selected: focused === WINDOWS.MAIN,
      shade: mainShade,
      draggable: true,
      loading,
      doubled,
      llama,
    });

    return (
      <DropTarget
        id="main-window"
        className={className}
        handleDrop={this.props.loadMedia}
        onWheel={this.props.scrollVolume}
      >
        <FocusTarget windowId={WINDOWS.MAIN}>
          <div
            id="title-bar"
            className="selected draggable"
            onDoubleClick={this.props.toggleMainWindowShadeMode}
          >
            <ContextMenuTarget
              id="option-context"
              bottom
              handle={<ClickedDiv id="option" title="Winamp Menu" />}
            >
              <MainContextMenu filePickers={filePickers} />
            </ContextMenuTarget>
            {mainShade && <MiniTime />}
            <Minimize />
            <Shade />
            <Close />
          </div>
          <div className="status">
            <ClutterBar />
            {!working && <div id="play-pause" />}
            <div
              id="work-indicator"
              className={classnames({ selected: working })}
            />
            <Time />
          </div>
          <Visualizer
            // @ts-ignore Visualizer is not typed yet
            analyser={this.props.analyser}
          />
          <div className="media-info">
            <Marquee />
            <Kbps />
            <Khz />
            <MonoStereo />
          </div>
          <MainVolume />
          <MainBalance />
          <div className="windows">
            <EqToggleButton />
            <PlaylistToggleButton />
          </div>
          <Position />
          <ActionButtons />
          <Eject />
          <div className="shuffle-repeat">
            <Shuffle />
            <Repeat />
          </div>
          <a
            id="about"
            target="blank"
            href="https://webamp.org/about"
            title="About"
          />
        </FocusTarget>
      </DropTarget>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  const {
    media: { status },
    display: { loading, doubled, llama, working },
    windows: { focused },
  } = state;
  return {
    mainShade: Boolean(getWindowShade(state)("main")),
    status,
    loading,
    doubled,
    llama,
    working,
    focused,
  };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    loadFilesFromReferences: (files: FileList) =>
      dispatch(loadFilesFromReferences(files)),
    toggleMainWindowShadeMode: () => dispatch(toggleMainWindowShadeMode()),
    scrollVolume: (e: React.WheelEvent<HTMLDivElement>) =>
      dispatch(scrollVolume(e)),
    loadMedia: (e: React.DragEvent<HTMLDivElement>) => dispatch(loadMedia(e)),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { forwardRef: true }
)(MainWindow);
