Hotkeys = {
    init: function(winamp) {
        keylog = [];
        trigger = [78,85,76,27,76,27,83,79,70,84];
        document.onkeyup = function(e){
            var key = e.keyCode;
            // Keys that correspond to node clicks
            var keyboardAction = {
                66: winamp.nodes.next, // B
                67: winamp.nodes.pause, // C
                76: winamp.nodes.eject, // L
                86: winamp.nodes.stop, // V
                82: winamp.nodes.repeat, // R
                83: winamp.nodes.shuffle, // S
                88: winamp.nodes.play, // X
                90: winamp.nodes.previous, // Z
                100: winamp.nodes.previous, // numpad 4
                101: winamp.nodes.play, // numpad 5
                102: winamp.nodes.next, // numpad 6
                96: winamp.nodes.eject // numpad 0
            };
            if(keyboardAction[key]){
                keyboardAction[key].click();
            }else if(e.keyCode == 76 && e.ctrlKey){ //CTRL+L
                winamp.nodes.option.click();
            }else if(e.keyCode == 68 && e.ctrlKey){ //CTRL+D
                winamp.nodes.buttonD.click();
            }else if(e.keyCode == 84 && e.ctrlKey){ //CTRL+T
                winamp.nodes.time.click();
            }else{
                switch (key){
                    // *1 is used to cast these values to integers. Could be improved.
                    // up arrow
                    case 38: winamp.setVolume((winamp.nodes.volume.value*1)+1); break;
                    // numpad 8
                    case 104: winamp.setVolume((winamp.nodes.volume.value*1)+1); break;
                    // down arrow
                    case 40: winamp.setVolume((winamp.nodes.volume.value*1)-1); break;
                    // numpad 2
                    case 98: winamp.setVolume((winamp.nodes.volume.value*1)-1); break;
                    // left arrow
                    case 37: winamp.media.seekToTime(winamp.media.timeElapsed() - 5); winamp.updateTime(); break;
                    // numpad 7
                    case 103: winamp.media.seekToTime(winamp.media.timeElapsed() - 5); winamp.updateTime(); break;
                    // right arrow
                    case 39: winamp.media.seekToTime(winamp.media.timeElapsed() + 5); winamp.updateTime(); break;
                    // numpad 9
                    case 105: winamp.media.seekToTime(winamp.media.timeElapsed() + 5); winamp.updateTime(); break;
                    // numpad 1
                    case 97: /* Placeholder for jump backwards 10 songs in playlist or to start of */ break;
                    // numpad 3
                    case 99: /* Placeholder for jump forwards 10 songs in playlist or to start of */ break;
                }
            }

            // Easter Egg
            keylog.push(key);
            keylog = keylog.slice(-10);
            if(keylog.toString() == trigger.toString()) {
                document.getElementById('winamp').classList.toggle('llama');
            }
        }
    }
}

