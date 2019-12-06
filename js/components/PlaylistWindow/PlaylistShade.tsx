import React, { useMemo } from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { getTimeStr } from "../../utils";
import { SET_FOCUSED_WINDOW } from "../../actionTypes";
import * as Selectors from "../../selectors";

import {
  WINDOWS,
  WINDOW_RESIZE_SEGMENT_WIDTH,
  WINDOW_WIDTH,
  CHARACTER_WIDTH,
  UTF8_ELLIPSIS,
} from "../../constants";
import { togglePlaylistShadeMode, closeWindow } from "../../actionCreators";
import CharacterString from "../CharacterString";
import PlaylistResizeTarget from "./PlaylistResizeTarget";
import { AppState, WindowId, Dispatch } from "../../types";

interface StateProps {
  name: string | null;
  duration: number | null;
  playlistSize: [number, number];
  focused: WindowId | null;
  trackOrder: number[];
}

interface DispatchProps {
  focusPlaylist: () => void;
  close: () => void;
  toggleShade: () => void;
}

type Props = StateProps & DispatchProps;

function PlaylistShade({
  name,
  playlistSize,
  duration,
  toggleShade,
  close,
  focusPlaylist,
  focused,
}: Props) {
  const addedWidth = playlistSize[0] * WINDOW_RESIZE_SEGMENT_WIDTH;

  const trimmedName = useMemo(() => {
    if (name == null) {
      return "[No file]";
    }

    const MIN_NAME_WIDTH = 205;

    const nameLength = (MIN_NAME_WIDTH + addedWidth) / CHARACTER_WIDTH;
    return name.length > nameLength
      ? name.slice(0, nameLength - 1) + UTF8_ELLIPSIS
      : name;
  }, [name, addedWidth]);

  const time = useMemo(() => {
    return name == null ? "" : getTimeStr(duration);
  }, [name, duration]);

  return (
    <div
      id="playlist-window-shade"
      className={classnames("window", "draggable", {
        selected: focused === WINDOWS.PLAYLIST,
      })}
      style={{ width: `${WINDOW_WIDTH + addedWidth}px` }}
      onMouseDown={focusPlaylist}
      onDoubleClick={toggleShade}
    >
      <div className="left">
        <div className="right draggable">
          <div id="playlist-shade-track-title">
            <CharacterString>{trimmedName}</CharacterString>
          </div>
          <div id="playlist-shade-time">
            <CharacterString>{time}</CharacterString>
          </div>
          <PlaylistResizeTarget widthOnly />
          <div id="playlist-shade-button" onClick={toggleShade} />
          <div id="playlist-close-button" onClick={close} />
        </div>
      </div>
    </div>
  );
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    focusPlaylist: () =>
      dispatch({
        type: SET_FOCUSED_WINDOW,
        window: WINDOWS.PLAYLIST,
      }),
    close: () => dispatch(closeWindow("playlist")),
    toggleShade: () => dispatch(togglePlaylistShadeMode()),
  };
};

const mapStateToProps = (state: AppState): StateProps => {
  const duration = Selectors.getDuration(state);
  const {
    windows: { focused },
  } = state;
  return {
    focused,
    playlistSize: Selectors.getWindowSize(state)("playlist"),
    trackOrder: Selectors.getOrderedTracks(state),
    duration,
    name: Selectors.getMinimalMediaText(state),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistShade);
