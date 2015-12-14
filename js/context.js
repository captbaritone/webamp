define([
  'my-file'
], function(
  MyFile
) {
  var Context = function(winamp) {
    this.winamp = winamp;

    var el = {
      option: document.getElementById('option'),
      playFile: document.getElementById('context-play-file'),
      loadSkin: document.getElementById('context-load-skin'),
      exit: document.getElementById('context-exit'),
      skinOptions: document.getElementsByClassName('skin-select')
    };

    // Click anywhere to close the context menu
    document.addEventListener('click', function() {
      el.option.classList.remove('selected');
    });

    // Click the context menu to close it
    el.option.addEventListener('click', function(e) {
      el.option.classList.toggle('selected');
      e.stopPropagation();
    });

    // Bind to each of the various skin options
    for (var i = 0; i < el.skinOptions.length; i++) {
      el.skinOptions[i].addEventListener('click', function(e) {
        this.loadSkin(e.target.dataset.skinUrl);
      }.bind(this));
    }

    // Play file and load skin both just spawn the file opener
    el.playFile.addEventListener('click', winamp.openFileDialog);
    el.loadSkin.addEventListener('click', winamp.openFileDialog);

    // Close all of Winamp
    el.exit.addEventListener('click', winamp.close);
  };

  Context.prototype.loadSkin = function(url) {
    var skinFile = new MyFile();
    skinFile.setUrl(url);
    this.winamp.setSkin(skinFile);
  };

  return Context;
});
