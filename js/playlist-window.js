PlaylistWindow = {
    init: function(winamp) {
        this.winamp = winamp;
        this.nodes = {
            'window': document.getElementById('playlist'),
            'top': document.querySelector('#playlist .top'),
            'shade': document.getElementById('playlist-shade'),
            'close': document.getElementById('playlist-close'),
            'tracks': document.getElementById('tracks'),
            'resizeHandle': document.getElementById('playlist-resize-handle')
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

        for(i = 0; i < this.winamp.playlist.length; i++) {
            var li = document.createElement('li');
            li.innerHTML = "<li>" + (i+1) + ". " + this.winamp.playlist[i].name + "</li>";
            tracks.appendChild(li);
        }

        this.updateCurrentTrack();
    },

    updateCurrentTrack: function() {
        var tracks = this.nodes.tracks.children;
        for(i = 0; i < tracks.length; i++) {
            if(i == this.winamp.currentTrack) {
                tracks[i].classList.add('selected');
            } else {
                tracks[i].classList.remove('selected');
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
        var dt = e.dataTransfer;
        var file = dt.files[0];
        this.winamp.enqueueFromFileReference(file, 0);
    }

}
