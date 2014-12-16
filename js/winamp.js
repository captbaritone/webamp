// UI and App logic
Winamp = {
    init: function(options) {
        this.fileManager = FileManager;
        this.media = Media.init();
        this.skin = SkinManager.init(document.getElementById('visualizer'), this.media._analyser);

        this.nodes = {
            'option': document.getElementById('option'),
            'close': document.getElementById('close'),
            'shade': document.getElementById('shade'),
            'buttonD': document.getElementById('button-d'),
            'position': document.getElementById('position'),
            'fileInput': document.getElementById('file-input'),
            'volumeMessage': document.getElementById('volume-message'),
            'balanceMessage': document.getElementById('balance-message'),
            'positionMessage': document.getElementById('position-message'),
            'songTitle': document.getElementById('song-title'),
            'time': document.getElementById('time'),
            'shadeTime': document.getElementById('shade-time'),
            'visualizer': document.getElementById('visualizer'),
            'previous': document.getElementById('previous'),
            'play': document.getElementById('play'),
            'pause': document.getElementById('pause'),
            'stop': document.getElementById('stop'),
            'next': document.getElementById('next'),
            'eject': document.getElementById('eject'),
            'repeat': document.getElementById('repeat'),
            'shuffle': document.getElementById('shuffle'),
            'volume': document.getElementById('volume'),
            'kbps': document.getElementById('kbps'),
            'khz': document.getElementById('khz'),
            'balance': document.getElementById('balance'),
            'playPause': document.getElementById('play-pause'),
            'workIndicator': document.getElementById('work-indicator'),
            'winamp': document.getElementById('winamp'),
            'titleBar': document.getElementById('title-bar'),
        };

        this.textDisplay = MultiDisplay.init(Font, this.nodes.songTitle);
        this.textDisplay.addRegister('songTitle');
        this.textDisplay.addRegister('position');
        this.textDisplay.addRegister('volume');
        this.textDisplay.addRegister('balance');
        this.textDisplay.addRegister('message'); // General purpose

        this.textDisplay.showRegister('songTitle');

        this.textDisplay.startRegisterMarquee('songTitle');

        this.setVolume(options.volume);
        this.setBalance(options.balance);
        this.loadFromUrl(options.mediaFile.url, options.mediaFile.name);
        this.skin.setSkinByUrl(options.skinUrl);

        this._registerListeners();
        return this;
    },

    _registerListeners: function() {
        self = this;
        // Make window dragable
        this.nodes.titleBar.addEventListener('mousedown',function(e){
            if(e.target !== this) {
                // Prevent going into drag mode when clicking any of the title
                // bar's icons by making sure the click was made directly on the
                // titlebar
                return true; }

            // Get starting window position
            var winampElm = self.nodes.winamp;

            // If the element was 'absolutely' positioned we could simply use
            // offsetLeft / offsetTop however the element is 'relatively'
            // positioned so we're using style.left. parseInt is used to remove the
            // 'px' postfix from the value
            var winStartLeft = parseInt(winampElm.offsetLeft || 0,10),
                winStartTop  = parseInt(winampElm.offsetTop || 0,10);

            // Get starting mouse position
            var mouseStartLeft = e.clientX,
                mouseStartTop = e.clientY;

            // Mouse move handler function while mouse is down
            function handleMove(e) {
                // Get current mouse position
                var mouseLeft = e.clientX,
                    mouseTop = e.clientY;

                // Calculate difference offsets
                var diffLeft = mouseLeft-mouseStartLeft,
                    diffTop = mouseTop-mouseStartTop;

                // These margins were only useful for centering the div, now we
                // don't need them
                winampElm.style.marginLeft = "0px";
                winampElm.style.marginTop = "0px";
                // Move window to new position
                winampElm.style.left = (winStartLeft+diffLeft)+"px";
                winampElm.style.top = (winStartTop+diffTop)+"px";
            }

            // Mouse button up
            function handleUp() {
                removeListeners();
            }

            function removeListeners() {
                window.removeEventListener('mousemove',handleMove);
                window.removeEventListener('mouseup',handleUp);
            }

            window.addEventListener('mousemove',handleMove);
            window.addEventListener('mouseup',handleUp);
        });

        this.nodes.option.onclick = function() {
            // We don't support playing from URLs any more
        }

        this.nodes.close.onclick = function() {
            self.close();
        }

        this.nodes.buttonD.onmousedown = function() {
            if(self.nodes.winamp.classList.contains('doubled')) {
                self.textDisplay.setRegisterText('message', 'Disable doublesize mode');
            } else {
                self.textDisplay.setRegisterText('message', 'Enable doublesize mode');
            }
            self.textDisplay.showRegister('message');
        }
        this.nodes.buttonD.onmouseup = function() {
            self.textDisplay.showRegister('songTitle');
        }

        this.nodes.buttonD.onclick = function() {
            this.classList.toggle('selected');
            self.nodes.winamp.classList.toggle('doubled');
        }

        this.media.addEventListener('timeupdate', function() {
            if(!self.nodes.winamp.classList.contains('setting-position')) {
                self.nodes.position.value = self.media.percentComplete();
            }
            self.updateTime();
        });

        this.media.addEventListener('visualizerupdate', function(analyser) {
            self.skin.visualizer.paintFrame(self.visualizerStyle, analyser);
        });

        this.media.addEventListener('ended', function() {
            self.skin.visualizer.clear();
            self.setStatus('stop');
        });

        this.media.addEventListener('waiting', function() {
            self.nodes.workIndicator.classList.add('selected');
        });

        this.media.addEventListener('playing', function() {
            self.setStatus('play');
            self.nodes.workIndicator.classList.remove('selected');
        });

        this.nodes.shade.onclick = function() {
            self.nodes.winamp.classList.toggle('shade');
        }

        this.nodes.time.onclick = function() {
            self.nodes.time.classList.toggle('countdown');
            self.updateTime();
        }

        this.nodes.shadeTime.onclick = function() {
            self.nodes.time.classList.toggle('countdown');
            self.updateTime();
        }

        this.nodes.visualizer.onclick = function() {
            if(self.skin.visualizer.style == self.skin.visualizer.NONE) {
                self.skin.visualizer.setStyle(self.skin.visualizer.BAR);
            } else if(self.skin.visualizer.style == self.skin.visualizer.BAR) {
                self.skin.visualizer.setStyle(self.skin.visualizer.OSCILLOSCOPE);
            } else if(self.skin.visualizer.style == self.skin.visualizer.OSCILLOSCOPE) {
                self.skin.visualizer.setStyle(self.skin.visualizer.NONE);
            }
            self.skin.visualizer.clear();
        }

        this.nodes.songTitle.onmousedown = function() {
            self.textDisplay.pauseRegisterMarquee('songTitle');
        }

        this.nodes.songTitle.onmouseup = function() {
            setTimeout(function () {
                self.textDisplay.startRegisterMarquee('songTitle');
            }, 1000);
        }

        this.nodes.previous.onclick = function() {
            // Implement this when we support playlists
        }

        this.nodes.play.onclick = function() {
            if(self.nodes.winamp.classList.contains('play')){
                self.media.stop();
            }
            self.media.play();
            self.setStatus('play');
        }

        this.nodes.pause.onclick = function() {
            if(self.nodes.winamp.classList.contains('pause')){
                self.media.play();
            }
            else if(self.nodes.winamp.classList.contains('play'))
            {
                self.media.pause();
                self.setStatus('pause');
            }
        }

        this.nodes.stop.onclick = function() {
            self.media.stop();
            self.setStatus('stop');
        }

        this.nodes.next.onclick = function() {
            // Implement this when we support playlists
        }

        this.nodes.eject.onclick = function() {
            self.openFileDialog();
        }

        this.nodes.fileInput.onchange = function(e){
            self.loadFromFileReference(e.target.files[0]);
        }

        this.nodes.volume.onmousedown = function() {
            self.textDisplay.showRegister('volume');
        }

        this.nodes.volume.onmouseup = function() {
            self.textDisplay.showRegister('songTitle');
        }

        this.nodes.volume.oninput = function() {
            self.setVolume(this.value);
        }

        this.nodes.position.onmousedown = function() {
            if(!self.nodes.winamp.classList.contains('stop')){
                self.textDisplay.showRegister('position');
                self.nodes.winamp.classList.add('setting-position');
            }
        }

        this.nodes.position.onmouseup = function() {
            self.textDisplay.showRegister('songTitle');
            self.nodes.winamp.classList.remove('setting-position');
        }

        this.nodes.position.oninput = function() {
            var newPercentComplete = self.nodes.position.value;
            var newFractionComplete = newPercentComplete/100;
            var newElapsed = self._timeString(self.media.duration() * newFractionComplete);
            var duration = self._timeString(self.media.duration());
            var message = "Seek to: " + newElapsed + "/" + duration + " (" + newPercentComplete + "%)";
            self.textDisplay.setRegisterText('position', message);
        }

        this.nodes.position.onchange = function() {
            if(!self.nodes.winamp.classList.contains('stop')){
                self.media.seekToPercentComplete(this.value);
            }
        }

        this.nodes.balance.onmousedown = function() {
            self.textDisplay.showRegister('balance');
        }

        this.nodes.balance.onmouseup = function() {
            self.textDisplay.showRegister('songTitle');
        }

        this.nodes.balance.oninput = function() {
            if(Math.abs(this.value) < 25) {
                this.value = 0;
            }
            self.setBalance(this.value);
        }

        this.nodes.repeat.onclick = function() {
            self.toggleRepeat();
        }

        this.nodes.shuffle.onclick = function() {
            self.toggleShuffle();
        }

        this.nodes.winamp.addEventListener('dragenter', this.dragenter.bind(this));
        this.nodes.winamp.addEventListener('dragover', this.dragover.bind(this));
        this.nodes.winamp.addEventListener('drop', this.drop.bind(this));
    },

    /* Functions */
    setStatus: function(className) {
        var statusOptions = ['play', 'stop', 'pause'];
        for(var i = 0; i < statusOptions.length; i++) {
            this.nodes.winamp.classList.remove(statusOptions[i]);
        }
        this.nodes.winamp.classList.add(className);
    },

    // From 0-100
    setVolume: function(volume) {
        // Ensure volume does not go out of bounds
        volume = Math.max(volume, 0);
        volume = Math.min(volume, 100);

        var percent = volume / 100;
        var sprite = Math.round(percent * 28);
        var offset = (sprite - 1) * 15;

        this.media.setVolume(percent);
        this.nodes.volume.style.backgroundPosition = '0 -' + offset + 'px';

        var message = 'Volume: ' + volume + '%';
        this.textDisplay.setRegisterText('volume', message);

        // This shouldn't trigger an infinite loop with volume.onchange(),
        // since the value will be the same
        this.nodes.volume.value = volume;
    },

    // From -100 to 100
    setBalance: function(balance) {
        var string = '';
        if(balance == 0) {
            string = 'Balance: Center';
        } else if(balance > 0) {
            string = 'Balance: ' + balance + '% Right';
        } else {
            string = 'Balance: ' + Math.abs(balance) + '% Left';
        }
        this.textDisplay.setRegisterText('balance', string);

        this.media.setBalance(balance);
        balance = Math.abs(balance) / 100
        sprite = Math.round(balance * 28);
        offset = (sprite - 1) * 15;
        this.nodes.balance.style.backgroundPosition = '-9px -' + offset + 'px';
    },

    toggleRepeat: function() {
        this.media.toggleRepeat();
        this.nodes.repeat.classList.toggle('selected');
    },

    toggleShuffle: function() {
        this.media.toggleShuffle();
        this.nodes.shuffle.classList.toggle('selected');
    },

    // TODO: Refactor this function
    updateTime: function() {
        this.updateShadePositionClass();

        var shadeMinusCharacter = ' ';
        if(this.nodes.time.classList.contains('countdown')) {
            digits = this._timeObject(this.media.timeRemaining());
            var shadeMinusCharacter = '-';
        } else {
            digits = this._timeObject(this.media.timeElapsed());
        }
        this.skin.font.displayCharacterInNode(shadeMinusCharacter, document.getElementById('shade-minus-sign'));

        var digitNodes = [
            document.getElementById('minute-first-digit'),
            document.getElementById('minute-second-digit'),
            document.getElementById('second-first-digit'),
            document.getElementById('second-second-digit')
        ];
        var shadeDigitNodes = [
            document.getElementById('shade-minute-first-digit'),
            document.getElementById('shade-minute-second-digit'),
            document.getElementById('shade-second-first-digit'),
            document.getElementById('shade-second-second-digit')
        ];

        // For each digit/node
        for(i = 0; i < 4; i++) {
            var digit = digits[i];
            var digitNode = digitNodes[i];
            var shadeNode = shadeDigitNodes[i];
            digitNode.innerHTML = '';
            digitNode.appendChild(this.skin.font.digitNode(digit));
            this.skin.font.displayCharacterInNode(digit, shadeNode);
        }
    },

    close: function() {
        this.media.stop();
        this.setStatus('stop'); // Currently unneeded
        this.nodes.winamp.classList.add('closed');
    },

    openFileDialog: function() {
        this.nodes.fileInput.click();
    },

    // In shade mode, the position slider shows up differently depending on if
    // it's near the start, middle or end of its progress
    updateShadePositionClass: function() {
        var position = this.nodes.position;

        position.removeAttribute("class");
        if(position.value <= 33) {
            position.classList.add('left');
        } else if(position.value >= 66) {
            position.classList.add('right');
        }
    },

    dragenter: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },

    dragover: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },

    drop: function(e) {
        e.stopPropagation();
        e.preventDefault();
        var dt = e.dataTransfer;
        var file = dt.files[0];
        this.loadFromFileReference(file);
    },

    loadFromFileReference: function(fileReference) {
        if(new RegExp("(wsz|zip)$", 'i').test(fileReference.name)) {
            this.skin.setSkinByFileReference(fileReference);
        } else {
            this.media.autoPlay = true;
            this.fileName = fileReference.name;
            this.fileManager.bufferFromFileReference(fileReference, this._loadBuffer.bind(this));
        }
    },

    // Used only for the initial load, since it must have a CORS header
    loadFromUrl: function(url, fileName) {
        this.fileName = fileName;
        this.fileManager.bufferFromUrl(url, this._loadBuffer.bind(this));
    },

    _loadBuffer: function(buffer) {
        // Note, this will not happen right away
        this.media.loadBuffer(buffer, this._setMetaData.bind(this));
    },

    _setTitle: function() {
        var duration = this._timeString(this.media.duration());
        var name = this.fileName + ' (' + duration + ')  ***  ';
        this.textDisplay.setRegisterText('songTitle', name);
    },

    _setMetaData: function() {
        var kbps = "128";
        var khz = Math.round(this.media.sampleRate() / 1000).toString();

        this.skin.font.setNodeToString(document.getElementById('kbps'), kbps);
        this.skin.font.setNodeToString(document.getElementById('khz'), khz);
        this._setChannels();
        this.updateTime();
        this._setTitle();
    },

    _setChannels: function() {
        var channels = this.media.channels();
        document.getElementById('mono').classList.remove('selected');
        document.getElementById('stereo').classList.remove('selected');
        if(channels == 1) {
            document.getElementById('mono').classList.add('selected');
        } else if(channels == 2) {
            document.getElementById('stereo').classList.add('selected');
        }
    },

    /* Helpers */
    _timeObject: function(time) {
        var minutes = Math.floor(time / 60);
        var seconds = time - (minutes * 60);

        return [
            Math.floor(minutes / 10),
            Math.floor(minutes % 10),
            Math.floor(seconds / 10),
            Math.floor(seconds % 10)
        ];
    },

    _timeString: function(time) {
        var timeObject = this._timeObject(time);
        return timeObject[0] + timeObject[1] + ':' + timeObject[2] + timeObject[3];
    }
}
