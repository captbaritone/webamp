import { useMemo } from "react";
import classnames from "classnames";
import { getTimeStr } from "../../utils";
import * as Selectors from "../../selectors";

import {
  WINDOWS,
  WINDOW_RESIZE_SEGMENT_WIDTH,
  WINDOW_WIDTH,
  CHARACTER_WIDTH,
  UTF8_ELLIPSIS,
} from "../../constants";
import * as Actions from "../../actionCreators";
import CharacterString from "../CharacterString";
import PlaylistResizeTarget from "./PlaylistResizeTarget";
import { useTypedSelector, useActionCreator } from "../../hooks";

function PlaylistShade() {
  const focused = useTypedSelector(Selectors.getFocusedWindow);
  const getWindowSize = useTypedSelector(Selectors.getWindowSize);
  const playlistSize = getWindowSize("playlist");
  const duration = useTypedSelector(Selectors.getDuration);
  const name = useTypedSelector(Selectors.getMinimalMediaText);

  const closeWindow = useActionCreator(Actions.closeWindow);
  const toggleShade = useActionCreator(Actions.togglePlaylistShadeMode);
  const focusWindow = useActionCreator(Actions.setFocusedWindow);

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
  }, [addedWidth, name]);

  const time = useMemo(() => {
    return name == null ? "" : getTimeStr(duration);
  }, [duration, name]);

  return (
    <div
      id="playlist-window-shade"
      className={classnames("window", "draggable", {
        selected: focused === WINDOWS.PLAYLIST,
      })}
      style={{ width: `${WINDOW_WIDTH + addedWidth}px` }}
      onMouseDown={() => focusWindow("playlist")}
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
          <div
            id="playlist-close-button"
            onClick={() => closeWindow("playlist")}
          />
        </div>
      </div>
    </div>
  );
}

export default PlaylistShade;
