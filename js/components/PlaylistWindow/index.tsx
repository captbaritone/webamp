import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { WINDOWS, TRACK_HEIGHT, LOAD_STYLE } from "../../constants";
import {
  scrollUpFourTracks,
  scrollDownFourTracks,
  togglePlaylistShadeMode,
  scrollVolume,
  closeWindow,
  loadMedia,
} from "../../actionCreators";
import * as Selectors from "../../selectors";

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
import FocusTarget from "../FocusTarget";

interface StateProps {
  offset: number;
  maxTrackIndex: number;
  playlistWindowPixelSize: { width: number; height: number };
  showVisualizer: boolean;
  activateVisualizer: boolean;
  selected: boolean;
  skinPlaylistStyle: PlaylistStyle;
  playlistSize: [number, number];
  playlistShade: boolean;
  duration: number | null;
}

interface DispatchProps {
  close(): void;
  toggleShade(): void;
  scrollUpFourTracks(): void;
  scrollDownFourTracks(): void;
  loadMedia(e: React.DragEvent<HTMLDivElement>, startIndex: number): void;
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
    this.props.loadMedia(e, atIndex);
  };

  render() {
    const {
      skinPlaylistStyle,
      selected,
      playlistSize,
      playlistWindowPixelSize,
      playlistShade,
      close,
      toggleShade,
      analyser,
      showVisualizer,
      activateVisualizer,
    } = this.props;
    if (playlistShade) {
      return <PlaylistShade />;
    }

    const style = {
      color: skinPlaylistStyle.normal,
      backgroundColor: skinPlaylistStyle.normalbg,
      fontFamily: `${skinPlaylistStyle.font}, Arial, sans-serif`,
      height: `${playlistWindowPixelSize.height}px`,
      width: `${playlistWindowPixelSize.width}px`,
    };

    const classes = classnames("window", "draggable", { selected });

    const showSpacers = playlistSize[0] % 2 === 0;

    return (
      <DropTarget
        id="playlist-window"
        className={classes}
        style={style}
        handleDrop={this._handleDrop}
        onWheel={this.props.scrollVolume}
      >
        <FocusTarget windowId={WINDOWS.PLAYLIST}>
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
              {showVisualizer && (
                <div className="playlist-visualizer">
                  {activateVisualizer && (
                    <div className="visualizer-wrapper">
                      <Visualizer
                        // @ts-ignore Visualizer is not yet typed
                        analyser={analyser}
                      />
                    </div>
                  )}
                </div>
              )}
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
        </FocusTarget>
      </DropTarget>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    close: () => dispatch(closeWindow(WINDOWS.PLAYLIST)),
    toggleShade: () => dispatch(togglePlaylistShadeMode()),
    scrollUpFourTracks: () => dispatch(scrollUpFourTracks()),
    scrollDownFourTracks: () => dispatch(scrollDownFourTracks()),
    loadMedia: (e, startIndex) =>
      dispatch(loadMedia(e, LOAD_STYLE.NONE, startIndex)),
    scrollVolume: e => dispatch(scrollVolume(e)),
  };
};

const mapStateToProps = (state: AppState): StateProps => {
  const {
    playlist: { trackOrder },
  } = state;
  const playlistSize = Selectors.getWindowSize(state)(WINDOWS.PLAYLIST);

  return {
    offset: Selectors.getScrollOffset(state),
    maxTrackIndex: trackOrder.length - 1,
    playlistWindowPixelSize: Selectors.getWindowPixelSize(state)(
      WINDOWS.PLAYLIST
    ),
    showVisualizer: playlistSize[0] > 2,
    activateVisualizer: !Selectors.getWindowOpen(state)(WINDOWS.MAIN),
    playlistSize,
    selected: Selectors.getFocusedWindow(state) === WINDOWS.PLAYLIST,
    skinPlaylistStyle: Selectors.getSkinPlaylistStyle(state),
    playlistShade: Boolean(Selectors.getWindowShade(state)(WINDOWS.PLAYLIST)),
    duration: Selectors.getDuration(state),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlaylistWindow);
