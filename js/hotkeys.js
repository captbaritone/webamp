import {play, pause, stop} from './actionCreators';

module.exports = function(winamp, store) {
  var keylog = [];
  var trigger = [78, 85, 76, 27, 76, 27, 83, 79, 70, 84];
  document.addEventListener('keydown', function(e){
    if (e.ctrlKey) { // Is CTRL depressed?
      switch (e.keyCode) {
        // CTRL+D
        case 68: winamp.dispatch({type: 'TOGGLE_DOUBLESIZE_MODE'}); break;
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
          const incrementedVolume = Math.min(100, store.getState().media.volume + 1);
          store.dispatch({type: 'SET_VOLUME', volume: incrementedVolume});
          break;
        case 39: winamp.seekForwardBy(5); break;      // right arrow
        // down arrow
        case 40:
          const decrementedVolume = Math.max(0, store.getState().media.volume - 1);
          store.dispatch({type: 'SET_VOLUME', volume: decrementedVolume});
          break;
        case 66: winamp.next(); break;                // B
        // C
        case 67: winamp.dispatch(pause(winamp.media)); break;
        // L
        case 76: store.dispatch({type: 'OPEN_FILE_DIALOG'}); break;
        case 82: winamp.toggleRepeat(); break;        // R
        case 83: winamp.toggleShuffle(); break;       // S
        // V
        case 86: winamp.dispatch(stop(winamp.media)); break;
        // X
        case 88: winamp.dispatch(play(winamp.media)); break;
        case 90: winamp.previous(); break;            // Z
        // numpad 0
        case 96: store.dispatch({type: 'OPEN_FILE_DIALOG'}); break;
        case 97: winamp.previous(10); break;          // numpad 1
        case 98: winamp.incrementVolumeBy(-1); break; // numpad 2
        case 99: winamp.next(10); break;              // numpad 3
        case 100: winamp.previous(); break;           // numpad 4
        // numpad 5
        case 101: winamp.dispatch(play(winamp.media)); break;
        case 102: winamp.next(); break;               // numpad 6
        case 103: winamp.seekForwardBy(-5); break;    // numpad 7
        case 104: winamp.incrementVolumeBy(1); break; // numpad 8
        case 105: winamp.seekForwardBy(5); break;     // numpad 9
      }
    }

    // Easter Egg
    keylog.push(e.keyCode);
    keylog = keylog.slice(-10);
    if (keylog.toString() === trigger.toString()) {
      winamp.dispatch({type: 'TOGGLE_LLAMA_MODE'});
    }
  });
};
