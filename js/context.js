Context = {
    // The Option button
    option: document.getElementById('option'),

    init: function(winamp) {
        var self = this;

        document.onclick = function() {
            self.option.classList.remove('selected');
        }

        this.option.onclick = function(event) {
            self.option.classList.toggle('selected');
            event.stopPropagation();
        }

        var skinSelectNodes = document.getElementsByClassName('skin-select');
        for(var i = 0; i < skinSelectNodes.length; i++) {
            skinSelectNodes[i].onclick = function() {
                winamp.setSkinByUrl(this.dataset.skinUrl);
            }
        }

        document.getElementById('context-play-file').onclick = function(event) {
            self.option.classList.remove('selected');
            winamp.openFileDialog();
        };
        document.getElementById('context-load-skin').onclick = function(event) {
            self.option.classList.remove('selected');
            winamp.openFileDialog();
        };
        document.getElementById('context-exit').onclick = function() {
            winamp.close();
        };
    }
}
