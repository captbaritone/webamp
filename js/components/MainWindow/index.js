import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { WINDOWS } from "../../constants";

import MiniTime from "../MiniTime";

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
import Shuffle from "./Shuffle";
import Time from "./Time";
import Visualizer from "./Visualizer";
import MainVolume from "./MainVolume";

import { SET_FOCUSED_WINDOW, TOGGLE_CONTEXT_MENU } from "../../actionTypes";

import { loadFileFromReference } from "../../actionCreators";

import "../../../css/main-window.css";

export class MainWindow extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }

  handleClick() {
    this.props.dispatch({ type: SET_FOCUSED_WINDOW, window: WINDOWS.MAIN });
  }

  supress(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  handleDrop(e) {
    this.supress(e);
    const { files } = e.dataTransfer;
    // TODO: Move this to an actionCreator
    this.props.dispatch(loadFileFromReference(files[0]));
  }

  render() {
    const {
      focused,
      loading,
      doubled,
      shade,
      llama,
      status,
      working
    } = this.props;

    const className = classnames({
      window: true,
      // TODO: Handle these status changes in the individual components
      play: status === "PLAYING",
      stop: status === "STOPPED",
      pause: status === "PAUSED",
      selected: focused === WINDOWS.MAIN,
      draggable: true,
      loading,
      doubled,
      llama,
      shade
    });

    return (
      <div
        id="main-window"
        className={className}
        onMouseDown={this.handleClick}
        onDragEnter={this.supress}
        onDragOver={this.supress}
        onDrop={this.handleDrop}
      >
        <div id="title-bar" className="selected title-bard draggable">
          <div id="option" onClick={this.props.toggleMenu} title="Winamp Menu">
            <MainContextMenu fileInput={this.props.fileInput} />
          </div>
          {shade && <MiniTime />}
          <div id="minimize" />
          <Shade />
          <Close />
        </div>
        <div className="status">
          <ClutterBar />
          <div id="play-pause" />
          <div
            id="work-indicator"
            className={classnames({ selected: working })}
          />
          <Time />
          <Visualizer analyser={this.props.mediaPlayer._analyser} />
        </div>
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
        <Eject fileInput={this.props.fileInput} />
        <div className="shuffle-repeat">
          <Shuffle />
          <Repeat />
        </div>
        <a
          id="about"
          target="blank"
          href="https://github.com/captbaritone/winamp2-js"
          title="About"
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  const {
    media: { status },
    display: { loading, doubled, shade, llama, working },
    windows: { focused }
  } = state;
  return { status, loading, doubled, shade, llama, working, focused };
};

const mapDispatchToProps = dispatch => ({
  toggleMenu: e => {
    dispatch({ type: TOGGLE_CONTEXT_MENU });
    // TODO: Consider binding to a ref instead.
    // https://stackoverflow.com/a/24421834
    e.nativeEvent.stopImmediatePropagation();
  },
  dispatch
});
export default connect(mapStateToProps, mapDispatchToProps)(MainWindow);
