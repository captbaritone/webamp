PlaylistWindow = {
    init: function(winamp) {
        this.winamp = winamp;
        this.nodes = {
            'window': document.getElementById('playlist'),
            'top': document.querySelector('#playlist .top'),
            'shade': document.getElementById('playlist-shade'),
            'close': document.getElementById('playlist-close')
        };

        this.closed = this.nodes.window.classList.contains('closed');

        this.handle = this.nodes.top;
        this.body = this.nodes.window;

        this._registerListeners();
        return this;
    },

    _registerListeners: function() {
        var self = this;

        this.nodes.close.onclick = function() {
            self.close();
        }
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
        this.winamp.loadFromFileReference(file);
    }

}
