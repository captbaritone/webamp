module.exports = function(winamp) {
  var keylog = [];
  var trigger = [78, 85, 76, 27, 76, 27, 83, 79, 70, 84];
  document.addEventListener('keyup', function(e){
    if (e.ctrlKey) { // Is CTRL depressed?
      switch (e.keyCode) {
        case 68: winamp.toggleDoubledMode(); break;   // CTRL+D
        // XXX FIXME
        case 76: winamp.openOptionMenu(); break;      // CTRL+L
        case 84: winamp.toggleTimeMode(); break;      // CTRL+T
      }
    } else {
      switch (e.keyCode) {
        case 37: winamp.seekForwardBy(-5); break;     // left arrow
        case 38: winamp.incrementVolumeBy(1); break;  // up arrow
        case 39: winamp.seekForwardBy(5); break;      // right arrow
        case 40: winamp.incrementVolumeBy(-1); break; // down arrow
        case 66: winamp.next(); break;                // B
        case 67: winamp.pause(); break;               // C
        case 76: winamp.openFileDialog(); break;      // L
        case 82: winamp.toggleRepeat(); break;        // R
        case 83: winamp.toggleShuffle(); break;       // S
        case 86: winamp.stop(); break;                // V
        case 88: winamp.play(); break;                // X
        case 90: winamp.previous(); break;            // Z
        case 96: winamp.openFileDialog(); break;      // numpad 0
        case 97: winamp.previous(10); break;          // numpad 1
        case 98: winamp.incrementVolumeBy(-1); break; // numpad 2
        case 99: winamp.next(10); break;              // numpad 3
        case 100: winamp.previous(); break;           // numpad 4
        case 101: winamp.play(); break;               // numpad 5
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
      winamp.toggleLlama();
    }
  });
};
