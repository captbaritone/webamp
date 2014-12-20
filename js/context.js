Context = {
    init: function(winamp) {
        document.onclick = function() {
            winamp.closeOptionMenu();
        }

        var skinSelectNodes = document.getElementsByClassName('skin-select');
        for(var i = 0; i < skinSelectNodes.length; i++) {
            skinSelectNodes[i].onclick = function() {
                winamp.setSkinByUrl(this.dataset.skinUrl);
            }
        }
        document.getElementById('context-play-file').onclick = function(event) {
            winamp.openFileDialog();
            // Makes the option menu close. Not 100% sure why
            event.stopPropagation();
        };
        document.getElementById('context-load-skin').onclick = function(event) {
            winamp.openFileDialog();
            // Makes the option menu close. Not 100% sure why
            event.stopPropagation();
        };
        document.getElementById('context-exit').onclick = function() {
            winamp.close();
        };
    }
}
