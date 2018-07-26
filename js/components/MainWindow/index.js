import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { WINDOWS } from "../../constants";
import {
  loadFilesFromReferences,
  removeAllTracks,
  toggleMainWindowShadeMode,
  scrollVolume
} from "../../actionCreators";
import { getWindowShade } from "../../selectors";

import DropTarget from "../DropTarget";
import MiniTime from "../MiniTime";

import { SET_FOCUSED_WINDOW } from "../../actionTypes";
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

export class MainWindow extends React.Component {
  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
    this._handleDrop = this._handleDrop.bind(this);
  }

  _handleClick() {
    this.props.setFocus();
  }

  _handleDrop(e) {
    this.props.loadFilesFromReferences(e);
  }

  render() {
    const {
      focused,
      loading,
      doubled,
      mainShade,
      llama,
      status,
      working,
      filePickers
    } = this.props;

    const className = classnames({
      window: true,
      play: status === "PLAYING",
      stop: status === "STOPPED",
      pause: status === "PAUSED",
      selected: focused === WINDOWS.MAIN,
      shade: mainShade,
      draggable: true,
      loading,
      doubled,
      llama
    });

    return (
      <DropTarget
        id="main-window"
        className={className}
        onMouseDown={this._handleClick}
        handleDrop={this._handleDrop}
        onWheel={this.props.scrollVolume}
      >
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
        <Visualizer analyser={this.props.analyser} />
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
          href="https://github.com/captbaritone/webamp"
          title="About"
        />
      </DropTarget>
    );
  }
}

const mapStateToProps = state => {
  const {
    media: { status },
    display: { loading, doubled, llama, working },
    windows: { focused }
  } = state;
  return {
    mainShade: getWindowShade(state, "main"),
    status,
    loading,
    doubled,
    llama,
    working,
    focused
  };
};

const mapDispatchToProps = {
  setFocus: () => ({ type: SET_FOCUSED_WINDOW, window: WINDOWS.MAIN }),
  loadFilesFromReferences: e => loadFilesFromReferences(e.dataTransfer.files),
  removeAllTracks,
  toggleMainWindowShadeMode,
  scrollVolume
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainWindow);
