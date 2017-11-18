import {
  play,
  pause,
  stop,
  adjustVolume,
  toggleRepeat,
  toggleShuffle,
  openFileDialog,
  seekForward,
  seekBackward,
  reverseList
} from "./actionCreators";

import {
  TOGGLE_DOUBLESIZE_MODE,
  TOGGLE_TIME_MODE,
  TOGGLE_LLAMA_MODE
} from "./actionTypes";

import { arraysAreEqual } from "./utils";

export default function(fileInput, { dispatch }) {
  let keylog = [];
  const trigger = [
    78, // N
    85, // U
    76, // L
    76, // L
    83, // S
    79, // O
    70, // F
    84 // T
  ];
  document.addEventListener("keydown", e => {
    if (e.ctrlKey) {
      // Is CTRL depressed?
      switch (e.keyCode) {
        case 68: // CTRL+D
          dispatch({ type: TOGGLE_DOUBLESIZE_MODE });
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
          // Next
          break;
        case 67: // C
          dispatch(pause());
          break;
        case 76: // L
          dispatch(openFileDialog(fileInput));
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
          // Previous
          break;
        case 96: // numpad 0
          dispatch(openFileDialog(fileInput));
          break;
        case 97: // numpad 1
          // Previous (10 tracks)
          break;
        case 98: // numpad 2
          dispatch(adjustVolume(-1));
          break;
        case 99: // numpad 3
          // Next (10 tracks)
          break;
        case 100: // numpad 4
          // Previous
          break;
        case 101: // numpad 5
          dispatch(play());
          break;
        case 102: // numpad 6
          // Next
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

    // Ignore escape. Usually this get's swallowed by the browser, but not always.
    if (e.keyCode !== 27) {
      keylog.push(e.keyCode);
      keylog = keylog.slice(-8);
      if (arraysAreEqual(keylog, trigger)) {
        dispatch({ type: TOGGLE_LLAMA_MODE });
      }
    }
  });
}
