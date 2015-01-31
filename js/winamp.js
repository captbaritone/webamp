// UI and App logic
Winamp = {
    init: function(options) {
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.style.display = 'none';

        this.windowManager = WindowManager;
        this.media = Media.init();
        this.skin = SkinManager.init(document.getElementById('visualizer'), this.media._analyser);
        this.state = '';

        this.mainWindow = MainWindow.init(this);
        this.playlistWindow = PlaylistWindow.init(this);

        this.playlist = [];
        this.currentTrack = null;
        this.loadedTrack = null;
        this.autoPlay = false;

        this.events = {
            timeUpdated: new Event('timeUpdated'),
            startWaiting: new Event('startWaiting'),
            stopWaiting: new Event('stopWaiting'),
            startLoading: new Event('startLoading'),
            stopLoading: new Event('stopLoading'),
            toggleTimeMode: new Event('toggleTimeMode'),
            changeState: new Event('changeState'),
            titleUpdated: new Event('titleUpdated'),
            channelCountUpdated: new Event('channelCountUpdated'),
            volumeChanged: new Event('volumeChanged'),
            balanceChanged: new Event('balanceChanged'),
            doubledModeToggled: new Event('doubledModeToggled'),
            repeatToggled: new Event('repeatToggled'),
            llamaToggled: new Event('llamaToggled'),
            openPlaylist: new Event('openPlaylist'),
            closePlaylist: new Event('closePlaylist'),
            tracksUpdated: new Event('tracksUpdated'),
            currentTrackChanged: new Event('currentTrackChanged')
        };

        this.setVolume(options.volume);
        this.setBalance(options.balance);
        this.enqueueFromUrl(options.mediaFile.url, options.mediaFile.name);
        var skinFile = new MyFile();
        skinFile.setUrl(options.skinUrl);
        this.setSkin(skinFile);

        this._registerListeners();
        return this;
    },

    _registerListeners: function() {
        var self = this;

        this.windowManager.registerWindow('main', this.mainWindow);
        this.windowManager.registerWindow('playlist', this.playlistWindow);

        this.media.addEventListener('timeupdate', function() {
            window.dispatchEvent(self.events.timeUpdated);
        });

        this.media.addEventListener('visualizerupdate', function(analyser) {
            self.skin.visualizer.paintFrame(self.visualizerStyle, analyser);
        });

        this.media.addEventListener('ended', function() {
            self.skin.visualizer.clear();
            var lastTrack = (self.currentTrack + 1 == self.playlist.length);
            if(lastTrack && !self.media.repeatEnabled()) {
                self.setState('stop');
            } else {
                self.next();
            }
        });

        this.media.addEventListener('waiting', function() {
            window.dispatchEvent(self.events.startWaiting);
        });

        this.media.addEventListener('playing', function() {
            self.setState('play');
            window.dispatchEvent(self.events.stopWaiting);
        });

        this.fileInput.onchange = function(e){
            self.emptyPlaylist();
            var files = e.dataTransfer.files;
            for(var i = 0; i < files.length; i++) {
                var file = new MyFile();
                file.setFileReference(files[i]);
                this.enqueue(file);
            }
            this.next();
        };
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

    getPercentComplete: function() {
        return this.media.percentComplete();
    },

    getChannelCount: function() {
        return this.media.channels();
    },

    getVolume: function() {
        return Math.round(this.media.getVolume() * 100);
    },

    seekToPercentComplete: function(percent) {
        this.media.seekToPercentComplete(percent);
    },

    toggleTimeMode: function() {
        window.dispatchEvent(this.events.toggleTimeMode);
    },

    previous: function(num) {
        if(this.currentTrack > 0) {
            this.playTrack(this.currentTrack - 1);
            window.dispatchEvent(this.events.currentTrackChanged);
        } else  {
            this.playTrack(0);
        }
    },

    play: function() {
        if(this.getState() === 'play'){
            this.media.stop();
        }
        this.media.play();
        this.setState('play');
    },

    pause: function() {
        if(this.getState() === 'pause'){
            this.media.play();
        }
        else if(this.getState() === 'play')
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
        var nextTrack = this.currentTrack + 1;
        if(nextTrack < this.playlist.length) {
            this.playTrack(this.currentTrack + 1);
        } else  {
            this.playTrack(0);
        }
        window.dispatchEvent(this.events.currentTrackChanged);
    },

    // From 0-100
    setVolume: function(volume) {
        // Ensure volume does not go out of bounds
        volume = Math.max(volume, 0);
        volume = Math.min(volume, 100);

        var percent = volume / 100;

        this.media.setVolume(percent);
        window.dispatchEvent(this.events.volumeChanged);
    },

    incrementVolumeBy: function(ammount) {
        this.setVolume((this.media.getVolume() * 100) + ammount);
    },

    toggleDoubledMode: function() {
        window.dispatchEvent(this.events.doubledModeToggled);
    },

    // From -100 to 100
    setBalance: function(balance) {
        this.media.setBalance(balance);
        window.dispatchEvent(this.events.balanceChanged);
    },

    getBalance: function() {
        return this.media.getBalance();
    },

    seekForwardBy: function(seconds) {
        this.media.seekToTime(this.media.timeElapsed() + seconds);
        window.dispatchEvent(self.events.timeUpdated);
    },

    toggleRepeat: function() {
        this.media.toggleRepeat();
        window.dispatchEvent(this.events.repeatToggled);
    },

    toggleShuffle: function() {
        this.media.toggleShuffle();
        this.mainWindow.toggleShuffle();
    },

    toggleLlama: function() {
        window.dispatchEvent(this.events.llamaToggled);
    },

    close: function() {
        this.media.stop();
        this.setState('stop'); // Currently unneeded
    },

    openPlaylist: function() {
        window.dispatchEvent(this.events.openPlaylist);
    },

    closePlaylist: function() {
        window.dispatchEvent(this.events.closePlaylist);
    },

    togglePlaylist: function() {
        if(this.playlistWindow.isClosed()) {
            this.openPlaylist();
        } else {
            this.closePlaylist();
        }
    },

    openFileDialog: function() {
        this.fileInput.click();
    },

    enqueueFromFileReference: function(fileReference) {
        var file = new MyFile();
        file.setFileReference(fileReference);
        if(new RegExp("(wsz|zip)$", 'i').test(fileReference.name)) {
            this.skin.setSkinByFile(file);
        } else {
            this.enqueue(file);
        }
    },

    loadFile: function(file) {
        this.fileName = file.name;
        file.processBuffer(this._loadBuffer.bind(this));
    },

    playTrack: function(track) {
        if(this.loadedTrack != track) {
            this.currentTrack = track;
            var file = this.playlist[this.currentTrack];
            this.autoPlay = true;
            this.loadFile(file);
        } else {
            this.play();
        }
    },

    enqueue: function(file) {
        this.playlist.push(file);
        var trackNumber = this.playlist.length - 1;
        if(this.currentTrack == null) {
            this.currentTrack = trackNumber;
            this.loadFile(file);
            window.dispatchEvent(this.events.currentTrackChanged);
        }
        window.dispatchEvent(this.events.tracksUpdated);
        return trackNumber;
    },

    emptyPlaylist: function() {
        this.playlist = [];
        this.currentTrack = null;
        window.dispatchEvent(this.events.tracksUpdated);
    },

    // Used only for the initial load, since it must have a CORS header
    enqueueFromUrl: function(url, fileName) {
        var file = new MyFile();
        file.setUrl(url);
        file.name = fileName;
        var trackNumber = this.enqueue(file);
    },

    setSkin: function(file) {
        this.setLoadingState();
        this.skin.setSkinByFile(file, this.unsetLoadingState.bind(this));
    },

    setLoadingState: function() {
        window.dispatchEvent(this.events.startLoading);
    },

    unsetLoadingState: function() {
        window.dispatchEvent(this.events.stopLoading);
    },

    toggleVisualizer: function() {
        if(this.skin.visualizer.style === this.skin.visualizer.NONE) {
            this.skin.visualizer.setStyle(this.skin.visualizer.BAR);
        } else if(this.skin.visualizer.style === this.skin.visualizer.BAR) {
            this.skin.visualizer.setStyle(this.skin.visualizer.OSCILLOSCOPE);
        } else if(this.skin.visualizer.style === this.skin.visualizer.OSCILLOSCOPE) {
            this.skin.visualizer.setStyle(this.skin.visualizer.NONE);
        }
        this.skin.visualizer.clear();
    },

    /* Listeners */
    _loadBuffer: function(buffer) {
        function setMetaData() {
            this.loadedTrack = this.currentTrack;
            if(this.autoPlay) {
                this.play();
                this.autoPlay = false;
            }
            var kbps = "128";
            var khz = Math.round(this.media.sampleRate() / 1000).toString();
            this.skin.font.setNodeToString(document.getElementById('kbps'), kbps);
            this.skin.font.setNodeToString(document.getElementById('khz'), khz);
            window.dispatchEvent(this.events.channelCountUpdated);
            window.dispatchEvent(this.events.titleUpdated);
            window.dispatchEvent(this.events.timeUpdated);
        }

        // Note, this will not happen right away
        this.media.loadBuffer(buffer, setMetaData.bind(this));
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
};
