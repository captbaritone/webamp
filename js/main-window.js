module.exports = {
  init: function(winamp) {
    this.nodes = {
      window: document.getElementById('main-window')
    };

    this.handle = document.getElementById('title-bar');
    this.body = this.nodes.window;

    document.getElementById('visualizer').onclick = function() {
      winamp.toggleVisualizer();
    };
    return this;
  }
};
