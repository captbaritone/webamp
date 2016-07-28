module.exports = {
  init: function(winamp) {
    this.winamp = winamp;
    this.nodes = {
      shade: document.getElementById('shade'),
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

    this.nodes.shade.onclick = function() {
      self.nodes.window.classList.toggle('shade');
    };

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

    window.addEventListener('startWaiting', function() {
      self.setWorkingIndicator();
    });
    window.addEventListener('stopWaiting', function() {
      self.unsetWorkingIndicator();
    });
    window.addEventListener('startLoading', function() {
      self.setLoadingState();
    });
    window.addEventListener('stopLoading', function() {
      self.unsetLoadingState();
    });
    window.addEventListener('changeState', function() {
      self.changeState();
    });
    window.addEventListener('doubledModeToggled', function() {
      self.toggleDoubledMode();
    });
    window.addEventListener('llamaToggled', function() {
      self.toggleLlama();
    });
    window.addEventListener('close', function() {
      self.nodes.window.classList.add('closed');
    });

    this.nodes.window.addEventListener('dragenter', this.dragenter.bind(this));
    this.nodes.window.addEventListener('dragover', this.dragover.bind(this));
    this.nodes.window.addEventListener('drop', this.drop.bind(this));
  },

  toggleDoubledMode: function() {
    this.nodes.buttonD.classList.toggle('selected');
    this.nodes.window.classList.toggle('doubled');
  },

  setWorkingIndicator: function() {
    this.nodes.workIndicator.classList.add('selected');
  },

  unsetWorkingIndicator: function() {
    this.nodes.workIndicator.classList.remove('selected');
  },

  setLoadingState: function() {
    this.nodes.window.classList.add('loading');
  },

  unsetLoadingState: function() {
    this.nodes.window.classList.remove('loading');
  },

  changeState: function() {
    var state = this.winamp.getState();
    var stateOptions = ['play', 'stop', 'pause'];
    for (var i = 0; i < stateOptions.length; i++) {
      this.nodes.window.classList.remove(stateOptions[i]);
    }
    this.nodes.window.classList.add(state);
  },

  toggleLlama: function() {
    this.nodes.window.classList.toggle('llama');
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
