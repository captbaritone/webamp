import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { WINDOWS, TRACK_HEIGHT } from "../../constants";
import { SET_FOCUSED_WINDOW } from "../../actionTypes";
import {
  toggleVisualizerStyle,
  scrollUpFourTracks,
  scrollDownFourTracks,
  loadFilesFromReferences,
  togglePlaylistShadeMode,
  scrollVolume,
  closeWindow
} from "../../actionCreators";
import * as Selectors from "../../selectors";

import { LOAD_STYLE } from "../../constants";

import { clamp } from "../../utils";
import DropTarget from "../DropTarget";
import Visualizer from "../Visualizer";
import PlaylistShade from "./PlaylistShade";
import AddMenu from "./AddMenu";
import RemoveMenu from "./RemoveMenu";
import SelectionMenu from "./SelectionMenu";
import MiscMenu from "./MiscMenu";
import ListMenu from "./ListMenu";
import PlaylistResizeTarget from "./PlaylistResizeTarget";
import PlaylistActionArea from "./PlaylistActionArea";
import TrackList from "./TrackList";
import ScrollBar from "./ScrollBar";

import "../../../css/playlist-window.css";
import { AppState, PlaylistStyle, Dispatch } from "../../types";

interface StateProps {
  offset: number;
  maxTrackIndex: number;
  playlistWindowPixelSize: { width: number; height: number };
  focused: string;
  skinPlaylistStyle: PlaylistStyle;
  playlistSize: [number, number];
  playlistShade: boolean;
  duration: number | null;
}

interface DispatchProps {
  focusPlaylist(): void;
  close(): void;
  toggleShade(): void;
  toggleVisualizerStyle(): void;
  scrollUpFourTracks(): void;
  scrollDownFourTracks(): void;
  loadFilesFromReferences(
    e: React.DragEvent<HTMLDivElement>,
    startIndex: number
  ): void;
  scrollVolume(e: React.WheelEvent<HTMLDivElement>): void;
}

interface OwnProps {
  analyser: AnalyserNode;
}

type Props = StateProps & DispatchProps & OwnProps;

class PlaylistWindow extends React.Component<Props> {
  _handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetCoords: { x: number; y: number }
  ) => {
    const top = e.clientY - targetCoords.y;
    const atIndex = clamp(
      this.props.offset + Math.round((top - 23) / TRACK_HEIGHT),
      0,
      this.props.maxTrackIndex + 1
    );
    this.props.loadFilesFromReferences(e, atIndex);
  };

  render() {
    const {
      skinPlaylistStyle,
      focusPlaylist,
      focused,
      playlistSize,
      playlistWindowPixelSize,
      playlistShade,
      close,
      toggleShade,
      analyser
    } = this.props;
    if (playlistShade) {
      return <PlaylistShade />;
    }

    const style = {
      color: skinPlaylistStyle.normal,
      backgroundColor: skinPlaylistStyle.normalbg,
      fontFamily: `${skinPlaylistStyle.font}, Arial, sans-serif`,
      height: `${playlistWindowPixelSize.height}px`,
      width: `${playlistWindowPixelSize.width}px`
    };

    const classes = classnames("window", "draggable", {
      selected: focused === WINDOWS.PLAYLIST,
      wide: playlistSize[0] > 2
    });

    const showSpacers = playlistSize[0] % 2 === 0;

    return (
      <DropTarget
        id="playlist-window"
        className={classes}
        style={style}
        onMouseDown={focusPlaylist}
        handleDrop={this._handleDrop}
        onWheel={this.props.scrollVolume}
      >
        <div className="playlist-top draggable" onDoubleClick={toggleShade}>
          <div className="playlist-top-left draggable" />
          {showSpacers && (
            <div className="playlist-top-left-spacer draggable" />
          )}
          <div className="playlist-top-left-fill draggable" />
          <div className="playlist-top-title draggable" />
          {showSpacers && (
            <div className="playlist-top-right-spacer draggable" />
          )}
          <div className="playlist-top-right-fill draggable" />
          <div className="playlist-top-right draggable">
            <div id="playlist-shade-button" onClick={toggleShade} />
            <div id="playlist-close-button" onClick={close} />
          </div>
        </div>
        <div className="playlist-middle draggable">
          <div className="playlist-middle-left draggable" />
          <div className="playlist-middle-center">
            <TrackList />
          </div>
          <div className="playlist-middle-right draggable">
            <ScrollBar />
          </div>
        </div>
        <div className="playlist-bottom draggable">
          <div className="playlist-bottom-left draggable">
            <AddMenu />
            <RemoveMenu />
            <SelectionMenu />
            <MiscMenu />
          </div>
          <div className="playlist-bottom-center draggable" />
          <div className="playlist-bottom-right draggable">
            <div
              className="playlist-visualizer"
              onClick={this.props.toggleVisualizerStyle}
            >
              {/* TODO: Resize the visualizer so it fits */
              false && (
                <Visualizer
                  // @ts-ignore Visualizer is not yet typed
                  analyser={analyser}
                />
              )}
            </div>
            <PlaylistActionArea />
            <ListMenu />
            <div
              id="playlist-scroll-up-button"
              onClick={this.props.scrollUpFourTracks}
            />
            <div
              id="playlist-scroll-down-button"
              onClick={this.props.scrollDownFourTracks}
            />
            <PlaylistResizeTarget />
          </div>
        </div>
      </DropTarget>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    focusPlaylist: () =>
      dispatch({
        type: SET_FOCUSED_WINDOW,
        window: WINDOWS.PLAYLIST
      }),
    close: () => dispatch(closeWindow("playlist")),
    toggleShade: () => dispatch(togglePlaylistShadeMode()),
    toggleVisualizerStyle: () => dispatch(toggleVisualizerStyle()),
    scrollUpFourTracks: () => dispatch(scrollUpFourTracks()),
    scrollDownFourTracks: () => dispatch(scrollDownFourTracks()),
    loadFilesFromReferences: (e, startIndex) =>
      dispatch(
        loadFilesFromReferences(
          e.dataTransfer.files,
          LOAD_STYLE.NONE,
          startIndex
        )
      ),
    scrollVolume: e => dispatch(scrollVolume(e))
  };
};

const mapStateToProps = (state: AppState): StateProps => {
  const {
    windows: { focused },
    playlist: { trackOrder }
  } = state;

  return {
    offset: Selectors.getScrollOffset(state),
    maxTrackIndex: trackOrder.length - 1,
    playlistWindowPixelSize: Selectors.getWindowPixelSize(state)("playlist"),
    focused,
    skinPlaylistStyle: Selectors.getSkinPlaylistStyle(state),
    playlistSize: Selectors.getWindowSize(state)("playlist"),
    playlistShade: Boolean(Selectors.getWindowShade(state)("playlist")),
    duration: Selectors.getDuration(state)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlaylistWindow);
