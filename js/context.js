define([
    'my-file'
], function(
    MyFile
) {
return {
    init: function(winamp) {
        this.winamp = winamp;

        // The Option button
        this.option = document.getElementById('option');
        var self = this;

        document.onclick = function() {
            self.option.classList.remove('selected');
        };

        this.option.onclick = function(event) {
            self.option.classList.toggle('selected');
            event.stopPropagation();
        };

        var skinSelectNodes = document.getElementsByClassName('skin-select');
        for(var i = 0; i < skinSelectNodes.length; i++) {
            skinSelectNodes[i].onclick = this._loadSkin.bind(this);
        }

        document.getElementById('context-play-file').onclick = function() {
            self.winamp.openFileDialog();
        };
        document.getElementById('context-load-skin').onclick = function() {
            self.winamp.openFileDialog();
        };
        document.getElementById('context-exit').onclick = function() {
            self.winamp.close();
        };
    },

    _loadSkin: function(event) {
        var skinFile = new MyFile();
        skinFile.setUrl(event.target.dataset.skinUrl);
        this.winamp.setSkin(skinFile);
    }
};
});
