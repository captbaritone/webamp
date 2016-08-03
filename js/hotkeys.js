import {
  play,
  pause,
  stop,
  adjustVolume,
  toggleRepeat,
  toggleShuffle
} from './actionCreators';

module.exports = function(winamp, store) {
  let keylog = [];
  const trigger = [78, 85, 76, 27, 76, 27, 83, 79, 70, 84];
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey) { // Is CTRL depressed?
      switch (e.keyCode) {
        // CTRL+D
        case 68: store.dispatch({type: 'TOGGLE_DOUBLESIZE_MODE'}); break;
        // XXX FIXME
        case 76: winamp.openOptionMenu(); break;      // CTRL+L
        // CTRL+T
        case 84: store.dispath({type: 'TOGGLE_TIME_MODE'}); break;
      }
    } else {
      switch (e.keyCode) {
        case 37: winamp.seekForwardBy(-5); break;     // left arrow
        // up arrow
        case 38:
          store.dispatch(adjustVolume(winamp.media, 1));
          break;
        case 39: winamp.seekForwardBy(5); break;      // right arrow
        // down arrow
        case 40:
          store.dispatch(adjustVolume(winamp.media, -1));
          break;
        case 66: winamp.next(); break;                // B
        // C
        case 67: store.dispatch(pause(winamp.media)); break;
        // L
        case 76: store.dispatch({type: 'OPEN_FILE_DIALOG'}); break;
        // R
        case 82: store.dispatch(toggleRepeat(winamp.media)); break;
        // S
        case 83: store.dispatch(toggleShuffle(winamp.media)); break;
        // V
        case 86: store.dispatch(stop(winamp.media)); break;
        // X
        case 88: store.dispatch(play(winamp.media)); break;
        case 90: winamp.previous(); break;            // Z
        // numpad 0
        case 96: store.dispatch({type: 'OPEN_FILE_DIALOG'}); break;
        case 97: winamp.previous(10); break;          // numpad 1
        // numpad 2
        case 98: store.dispatch(adjustVolume(winamp.media, -1)); break;
        case 99: winamp.next(10); break;              // numpad 3
        case 100: winamp.previous(); break;           // numpad 4
        // numpad 5
        case 101: store.dispatch(play(winamp.media)); break;
        case 102: winamp.next(); break;               // numpad 6
        case 103: winamp.seekForwardBy(-5); break;    // numpad 7
        // numpad 8
        case 104: store.dispatch(adjustVolume(winamp.media, 1)); break;
        case 105: winamp.seekForwardBy(5); break;     // numpad 9
      }
    }

    // Easter Egg
    keylog.push(e.keyCode);
    keylog = keylog.slice(-10);
    if (keylog.toString() === trigger.toString()) {
      store.dispatch({type: 'TOGGLE_LLAMA_MODE'});
    }
  });
};
