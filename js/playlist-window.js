PlaylistWindow = {
    init: function(winamp) {
        this.winamp = winamp;
        this.nodes = {
            'window': document.getElementById('playlist'),
            'top': document.querySelector('#playlist .top'),
            'shade': document.getElementById('playlist-shade'),
            'close': document.getElementById('playlist-close'),
            'tracks': document.getElementById('tracks'),
            'resizeHandle': document.getElementById('playlist-resize-handle'),
            'previous': document.getElementById('playlist-previous'),
            'play': document.getElementById('playlist-play'),
            'pause': document.getElementById('playlist-pause'),
            'stop': document.getElementById('playlist-stop'),
            'next': document.getElementById('playlist-next'),
            'eject': document.getElementById('playlist-eject')
        };

        this.closed = this.nodes.window.classList.contains('closed');

        this.handle = this.nodes.top;
        this.body = this.nodes.window;
        this.resizeHandle = this.nodes.resizeHandle;


        this._registerListeners();
        return this;
    },

    _registerListeners: function() {
        var self = this;

        window.addEventListener('openPlaylist', function() { self.open(); });
        window.addEventListener('closePlaylist', function() { self.close(); });
        window.addEventListener('tracksUpdated', function() { self.updateTracks(); });
        window.addEventListener('currentTrackChanged', function() { self.updateCurrentTrack(); });

        this.nodes.close.onclick = function() {
            self.winamp.closePlaylist();
        }

        this.nodes.shade.onclick = function() {
            self.nodes.window.classList.toggle('shade');
        }

        this.nodes.previous.onclick = function() {
            self.winamp.previous();
        }

        this.nodes.play.onclick = function() {
            self.winamp.play();
        }

        this.nodes.pause.onclick = function() {
            self.winamp.pause();
        }

        this.nodes.stop.onclick = function() {
            self.winamp.stop();
        }

        this.nodes.next.onclick = function() {
            self.winamp.next();
        }

        this.nodes.eject.onclick = function() {
            self.winamp.openFileDialog();
        }

        this.nodes.window.addEventListener('dragenter', this.dragenter.bind(this));
        this.nodes.window.addEventListener('dragover', this.dragover.bind(this));
        this.nodes.window.addEventListener('drop', this.drop.bind(this));
    },

    close: function() {
        this.nodes.window.classList.add('closed');
    },

    open: function() {
        this.nodes.window.classList.remove('closed');
    },

    isClosed: function() {
        return this.nodes.window.classList.contains('closed');
    },

    toggle: function() {
        if(this.isClosed()) {
            this.open();
        } else {
            this.close();
        }
    },

    updateTracks: function() {
        var tracks = this.nodes.tracks;
        while (tracks.firstChild) {
            tracks.removeChild(tracks.firstChild);
        }

        var self = this;
        for(var i = 0; i < this.winamp.playlist.length; i++) {
            var li = document.createElement('li');
            li.innerHTML = (i+1) + ". " + this.winamp.playlist[i].name;
            li.onclick = (function(trackNumber) {
                return function() { self.winamp.playTrack(trackNumber); };
            })(i);
            tracks.appendChild(li);
        }

        this.updateCurrentTrack();
    },

    updateCurrentTrack: function() {
        var tracks = this.nodes.tracks.children;
        for(var i = 0; i < tracks.length; i++) {
            if(i == this.winamp.currentTrack) {
                tracks[i].classList.add('current');
            } else {
                tracks[i].classList.remove('current');
            }
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
        var files = e.dataTransfer.files;
        for(var i = 0; i < files.length; i++) {
            var file = new MyFile();
            file.setFileReference(files[i]);
            this.winamp.enqueue(file);
        }
    }

}
