// UI and App logic
Winamp = {
    init: function(options) {
        this.fileManager = FileManager;

        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.style.display = 'none';

        this.windowManager = WindowManager;
        this.media = Media.init();
        this.skin = SkinManager.init(document.getElementById('visualizer'), this.media._analyser);
        this.state = '';

        this.mainWindow = MainWindow.init(this);

        this.events = {
            timeUpdated: new Event('timeUpdated'),
            startWaiting: new Event('startWaiting'),
            stopWaiting: new Event('stopWaiting'),
            startLoading: new Event('startLoading'),
            stopLoading: new Event('stopLoading'),
            toggleTimeMode: new Event('toggleTimeMode'),
            changeState: new Event('changeState')
        }

        this.setVolume(options.volume);
        this.setBalance(options.balance);
        this.loadFromUrl(options.mediaFile.url, options.mediaFile.name);
        this.setSkinByUrl(options.skinUrl);

        this._registerListeners();
        return this;
    },

    _registerListeners: function() {
        var self = this;

        this.windowManager.registerWindow(this.mainWindow);

        this.media.addEventListener('timeupdate', function() {
            self.mainWindow.updatePosition(self.media.percentComplete());
            window.dispatchEvent(self.events.timeUpdated);
        });

        this.media.addEventListener('visualizerupdate', function(analyser) {
            self.skin.visualizer.paintFrame(self.visualizerStyle, analyser);
        });

        this.media.addEventListener('ended', function() {
            self.skin.visualizer.clear();
            self.setState('stop');
        });

        this.media.addEventListener('waiting', function() {
            window.dispatchEvent(self.events.startWaiting);
        });

        this.media.addEventListener('playing', function() {
            self.setState('play');
            window.dispatchEvent(self.events.stopWaiting);
        });

        this.fileInput.onchange = function(e){
            self.loadFromFileReference(e.target.files[0]);
        }
    },

    /* Functions */
    setState: function(state) {
        this.state = state;
        window.dispatchEvent(this.events.changeState);
    },

    getState: function() {
        return this.state;
    },

    getDuration: function() {
        return this.media.duration();
    },

    getTimeRemaining: function() {
        return this.media.timeRemaining();
    },

    getTimeElapsed: function() {
        return this.media.timeElapsed();
    },

    seekToPercentComplete: function(percent) {
        this.media.seekToPercentComplete(percent);
    },

    toggleTimeMode: function() {
        window.dispatchEvent(this.events.toggleTimeMode);
    },

    previous: function(num) {
        // Jump back num tracks
        // Not yet supported
    },

    play: function() {
        if(this.getState() == 'play'){
            this.media.stop();
        }
        this.media.play();
        this.setState('play');
    },

    pause: function() {
        if(this.getState() == 'pause'){
            this.media.play();
        }
        else if(this.getState() == 'play')
        {
            this.media.pause();
            this.setState('pause');
        }
    },
    stop: function() {
        this.media.stop();
        this.setState('stop');
    },

    next: function(num) {
        // Jump back num tracks
        // Not yet supported
    },

    // From 0-100
    setVolume: function(volume) {
        // Ensure volume does not go out of bounds
        volume = Math.max(volume, 0);
        volume = Math.min(volume, 100);

        var percent = volume / 100;

        this.media.setVolume(percent);
        this.mainWindow.setVolume(volume);
    },

    incrementVolumeBy: function(ammount) {
        this.setVolume((this.media.getVolume() * 100) + ammount);
    },

    toggleDoubledMode: function() {
        this.mainWindow.toggleDoubledMode();
    },

    // From -100 to 100
    setBalance: function(balance) {
        this.media.setBalance(balance);
        this.mainWindow.setBalance(balance);
    },

    seekForwardBy: function(seconds) {
        this.media.seekToTime(this.media.timeElapsed() + seconds);
        window.dispatchEvent(self.events.timeUpdated);
    },

    toggleRepeat: function() {
        this.media.toggleRepeat();
        this.mainWindow.toggleRepeat();
    },

    toggleShuffle: function() {
        this.media.toggleShuffle();
        this.mainWindow.toggleShuffle();
    },

    toggleLlama: function() {
        this.mainWindow.toggleLlama();
    },

    close: function() {
        this.media.stop();
        this.setState('stop'); // Currently unneeded
    },

    openFileDialog: function() {
        this.fileInput.click();
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

    setSkinByUrl: function(url) {
        this.skin.setSkinByUrl(url);
    },

    setLoadingState: function() {
        window.dispatchEvent(this.events.startLoading);
    },

    unsetLoadingState: function() {
        window.dispatchEvent(this.events.stopLoading);
    },

    toggleVisualizer: function() {
        if(this.skin.visualizer.style == this.skin.visualizer.NONE) {
            this.skin.visualizer.setStyle(this.skin.visualizer.BAR);
        } else if(this.skin.visualizer.style == this.skin.visualizer.BAR) {
            this.skin.visualizer.setStyle(this.skin.visualizer.OSCILLOSCOPE);
        } else if(this.skin.visualizer.style == this.skin.visualizer.OSCILLOSCOPE) {
            this.skin.visualizer.setStyle(this.skin.visualizer.NONE);
        }
        this.skin.visualizer.clear();
    },

    /* Listeners */
    _loadBuffer: function(buffer) {
        // Note, this will not happen right away
        this.media.loadBuffer(buffer, this._setMetaData.bind(this));
    },

    _setMetaData: function() {
        var kbps = "128";
        var khz = Math.round(this.media.sampleRate() / 1000).toString();

        this.skin.font.setNodeToString(document.getElementById('kbps'), kbps);
        this.skin.font.setNodeToString(document.getElementById('khz'), khz);
        this._setChannels();
        window.dispatchEvent(this.events.timeUpdated);
        this.mainWindow.setTitle(this.fileName, this.media.duration());
    },

    _setChannels: function() {
        var channels = this.media.channels();
        this.mainWindow.setChannelCount(channels);
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
}
