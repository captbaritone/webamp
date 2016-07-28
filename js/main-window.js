module.exports = {
  init: function(winamp) {
    this.winamp = winamp;
    this.nodes = {
      buttonD: document.getElementById('button-d'),
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

    this.nodes.buttonD.onmousedown = function() {
      self.winamp.dispatch({type: 'SET_FOCUS', input: 'double'});
    };

    this.nodes.buttonD.onmouseup = function() {
      self.winamp.dispatch({type: 'TOGGLE_DOUBLESIZE_MODE'});
      self.winamp.dispatch({type: 'UNSET_FOCUS'});
    };

    this.nodes.visualizer.onclick = function() {
      self.winamp.toggleVisualizer();
    };

    this.nodes.window.addEventListener('dragenter', this.dragenter.bind(this));
    this.nodes.window.addEventListener('dragover', this.dragover.bind(this));
    this.nodes.window.addEventListener('drop', this.drop.bind(this));
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
};
