module.exports = {
  init: function(winamp) {
    this.winamp = winamp;
    this.nodes = {
      visualizer: document.getElementById('visualizer'),
      workIndicator: document.getElementById('work-indicator'),
      window: document.getElementById('main-window')
    };

    this.handle = document.getElementById('title-bar');
    this.body = this.nodes.window;

    this._registerListeners();
    return this;
  },

  _registerListeners: function() {
    var self = this;

    this.nodes.visualizer.onclick = function() {
      self.winamp.toggleVisualizer();
    };
  }
};
