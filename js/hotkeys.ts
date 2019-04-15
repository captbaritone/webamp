import {
  play,
  pause,
  stop,
  adjustVolume,
  toggleRepeat,
  toggleShuffle,
  openMediaFileDialog,
  seekForward,
  seekBackward,
  reverseList,
  nextN,
  next,
  previous,
  toggleDoubleSizeMode,
  toggleWindow,
} from "./actionCreators";

import { TOGGLE_TIME_MODE, TOGGLE_LLAMA_MODE } from "./actionTypes";

import { Dispatch } from "./types";

const IGNORE_EVENTS_FROM_TAGS = new Set(["input", "textarea", "select"]);

export function bindHotkeys(dispatch: Dispatch): () => void {
  let currentPos: number = 0;
  const trigger = [
    78, // N
    85, // U
    76, // L
    76, // L
    83, // S
    79, // O
    70, // F
    84, // T
  ];

  const listener = (e: KeyboardEvent) => {
    if (
      e.target instanceof Element &&
      IGNORE_EVENTS_FROM_TAGS.has(e.target.tagName.toLowerCase())
    ) {
      return;
    }
    if (e.ctrlKey) {
      switch (e.keyCode) {
        case 68: // CTRL+D
          dispatch(toggleDoubleSizeMode());
          e.preventDefault(); // Supress the "Bookmark" action on windows.
          break;
        case 76: // CTRL+L FIXME
          break;
        case 82: // CTRL+R
          dispatch(reverseList());
          break;
        case 84: // CTRL+T
          dispatch({ type: TOGGLE_TIME_MODE });
          break;
      }
    } else if (e.altKey) {
      switch (e.keyCode) {
        case 87: // ALT+W
          dispatch(toggleWindow("main"));
          break;
        case 69: // ALT+E
          dispatch(toggleWindow("playlist"));
          break;
        case 71: // ALT+G
          dispatch(toggleWindow("equalizer"));
          break;
      }
    } else {
      switch (e.keyCode) {
        case 37: // left arrow
          dispatch(seekBackward(5));
          break;
        case 38: // up arrow
          dispatch(adjustVolume(1));
          break;
        case 39: // right arrow
          dispatch(seekForward(5));
          break;
        case 40: // down arrow
          dispatch(adjustVolume(-1));
          break;
        case 66: // B
          dispatch(next());
          break;
        case 67: // C
          dispatch(pause());
          break;
        case 76: // L
          dispatch(openMediaFileDialog());
          break;
        case 82: // R
          dispatch(toggleRepeat());
          break;
        case 83: // S
          dispatch(toggleShuffle());
          break;
        case 86: // V
          dispatch(stop());
          break;
        case 88: // X
          dispatch(play());
          break;
        case 90: // Z
          dispatch(previous());
          break;
        case 96: // numpad 0
          dispatch(openMediaFileDialog());
          break;
        case 97: // numpad 1
          dispatch(nextN(-10));
          break;
        case 98: // numpad 2
          dispatch(adjustVolume(-1));
          break;
        case 99: // numpad 3
          dispatch(nextN(10));
          break;
        case 100: // numpad 4
          dispatch(previous());
          break;
        case 101: // numpad 5
          dispatch(play());
          break;
        case 102: // numpad 6
          dispatch(next());
          break;
        case 103: // numpad 7
          dispatch(seekBackward(5));
          break;
        case 104: // numpad 8
          dispatch(adjustVolume(1));
          break;
        case 105: // numpad 9
          dispatch(seekForward(5));
          break;
      }
    }

    // Easter Egg

    // Ignore escape. Usually this gets swallowed by the browser, but not always.
    if (e.keyCode !== 27) {
      currentPos = e.keyCode === trigger[currentPos] ? currentPos + 1 : 0;
      if (currentPos === trigger.length) {
        dispatch({ type: TOGGLE_LLAMA_MODE });
      }
    }
  };
  document.addEventListener("keydown", listener);

  return () => {
    document.removeEventListener("keydown", listener);
  };
}
