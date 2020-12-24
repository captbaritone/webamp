import { useCallback } from "react";
import classnames from "classnames";

import { WINDOWS, TRACK_HEIGHT, LOAD_STYLE } from "../../constants";
import * as Actions from "../../actionCreators";
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
import PlaylistScrollBar from "./PlaylistScrollBar";

import "../../../css/playlist-window.css";
import { AppState } from "../../types";
import FocusTarget from "../FocusTarget";
import { useActionCreator, useTypedSelector } from "../../hooks";

interface Props {
  analyser: AnalyserNode;
}

function _maxTrackIndex(state: AppState) {
  return state.playlist.trackOrder.length - 1;
}

function PlaylistWindow({ analyser }: Props) {
  const offset = useTypedSelector(Selectors.getScrollOffset);
  const getWindowSize = useTypedSelector(Selectors.getWindowSize);
  const selectedWindow = useTypedSelector(Selectors.getFocusedWindow);
  const getWindowShade = useTypedSelector(Selectors.getWindowShade);
  const getWindowOpen = useTypedSelector(Selectors.getWindowOpen);
  const maxTrackIndex = useTypedSelector(_maxTrackIndex);
  const skinPlaylistStyle = useTypedSelector(Selectors.getSkinPlaylistStyle);
  const getWindowPixelSize = useTypedSelector(Selectors.getWindowPixelSize);

  const selected = selectedWindow === WINDOWS.PLAYLIST;
  const playlistShade = Boolean(getWindowShade(WINDOWS.PLAYLIST));
  const playlistSize = getWindowSize(WINDOWS.PLAYLIST);
  const playlistWindowPixelSize = getWindowPixelSize(WINDOWS.PLAYLIST);

  const close = useActionCreator(Actions.closeWindow);
  const toggleShade = useActionCreator(Actions.togglePlaylistShadeMode);
  const scrollUpFourTracks = useActionCreator(Actions.scrollUpFourTracks);
  const scrollDownFourTracks = useActionCreator(Actions.scrollDownFourTracks);
  const scrollVolume = useActionCreator(Actions.scrollVolume);
  const loadMedia = useActionCreator(Actions.loadMedia);

  const showVisualizer = playlistSize[0] > 2;
  const activateVisualizer = !getWindowOpen(WINDOWS.MAIN);

  const handleDrop = useCallback(
    (
      e: React.DragEvent<HTMLDivElement>,
      targetCoords: { x: number; y: number }
    ) => {
      const top = e.clientY - targetCoords.y;
      const atIndex = clamp(
        offset + Math.round((top - 23) / TRACK_HEIGHT),
        0,
        maxTrackIndex + 1
      );
      loadMedia(e, LOAD_STYLE.NONE, atIndex);
    },
    [loadMedia, maxTrackIndex, offset]
  );

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
    <FocusTarget windowId={WINDOWS.PLAYLIST}>
      <DropTarget
        id="playlist-window"
        windowId={WINDOWS.PLAYLIST}
        className={classes}
        style={style}
        handleDrop={handleDrop}
        onWheel={scrollVolume}
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
            <div
              id="playlist-close-button"
              onClick={() => close(WINDOWS.PLAYLIST)}
            />
          </div>
        </div>
        <div className="playlist-middle draggable">
          <div className="playlist-middle-left draggable" />
          <div className="playlist-middle-center">
            <TrackList />
          </div>
          <div className="playlist-middle-right draggable">
            <PlaylistScrollBar />
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
            <div id="playlist-scroll-up-button" onClick={scrollUpFourTracks} />
            <div
              id="playlist-scroll-down-button"
              onClick={scrollDownFourTracks}
            />
            <PlaylistResizeTarget />
          </div>
        </div>
      </DropTarget>
    </FocusTarget>
  );
}

export default PlaylistWindow;
