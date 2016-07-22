import React from 'react';
import Marquee from './Marquee.jsx';
import Actions from './Actions.jsx';
import Time from './Time.jsx';
import ShadeTime from './ShadeTime.jsx';
import Kbps from './Kbps.jsx';
import Khz from './Khz.jsx';
import Volume from './Volume.jsx';
import Balance from './Balance.jsx';
import Position from './Position.jsx';

import '../css/main-window.css';

module.exports = {
  init: function(winamp) {
    this.winamp = winamp;
    this.nodes = {
      close: document.getElementById('close'),
      shade: document.getElementById('shade'),
      buttonD: document.getElementById('button-d'),
      visualizer: document.getElementById('visualizer'),
      eject: document.getElementById('eject'),
      repeat: document.getElementById('repeat'),
      shuffle: document.getElementById('shuffle'),
      mono: document.getElementById('mono'),
      stereo: document.getElementById('stereo'),
      workIndicator: document.getElementById('work-indicator'),
      titleBar: document.getElementById('title-bar'),
      window: document.getElementById('main-window')
    };

    this.handle = document.getElementById('title-bar');
    this.body = this.nodes.window;

    this.winamp.renderTo(<Marquee />, document.getElementById('song-title'));
    this.winamp.renderTo(<Actions />, document.getElementById('actions-holder'));
    this.winamp.renderTo(<Time />, document.getElementById('time-holder'));
    this.winamp.renderTo(<ShadeTime />, document.getElementById('shade-time-holder'));
    this.winamp.renderTo(<Kbps />, document.getElementById('kbps-holder'));
    this.winamp.renderTo(<Khz />, document.getElementById('khz-holder'));
    this.winamp.renderTo(<Volume />, document.getElementById('volume-holder'));
    this.winamp.renderTo(<Balance />, document.getElementById('balance-holder'));
    this.winamp.renderTo(<Position />, document.getElementById('position-holder'));

    this._registerListeners();
    return this;
  },

  _registerListeners: function() {
    var self = this;

    this.nodes.close.onclick = function() {
      self.winamp.close();
    };

    this.nodes.shade.onclick = function() {
      self.nodes.window.classList.toggle('shade');
    };

    this.nodes.buttonD.onmousedown = function() {
      if (self.nodes.window.classList.contains('doubled')) {
        self.winamp.dispatch({type: 'SET_MARQUEE_REGISTER', register: 'message', text: 'Disable doublesize mode'});
      } else {
        self.winamp.dispatch({type: 'SET_MARQUEE_REGISTER', register: 'message', text: 'Enable doublesize mode'});
      }
      self.winamp.dispatch({type: 'SHOW_MARQUEE_REGISTER', register: 'message'});
    };

    this.nodes.buttonD.onmouseup = function() {
      self.winamp.dispatch({type: 'SHOW_MARQUEE_REGISTER', register: 'songTitle'});
    };

    this.nodes.buttonD.onclick = function() {
      self.winamp.toggleDoubledMode();
    };

    this.nodes.eject.onclick = function() {
      self.winamp.dispatch({type: 'OPEN_FILE_DIALOG'});
    };

    this.nodes.repeat.onclick = function() {
      self.winamp.toggleRepeat();
    };

    this.nodes.shuffle.onclick = function() {
      self.winamp.toggleShuffle();
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
    window.addEventListener('titleUpdated', function() {
      self.updateTitle();
    });
    window.addEventListener('channelCountUpdated', function() {
      self.updateChannelCount();
    });
    window.addEventListener('doubledModeToggled', function() {
      self.toggleDoubledMode();
    });
    window.addEventListener('repeatToggled', function() {
      self.toggleRepeat();
    });
    window.addEventListener('llamaToggled', function() {
      self.toggleLlama();
    });
    window.addEventListener('close', function() {
      self.close();
    });

    this.nodes.window.addEventListener('dragenter', this.dragenter.bind(this));
    this.nodes.window.addEventListener('dragover', this.dragover.bind(this));
    this.nodes.window.addEventListener('drop', this.drop.bind(this));
  },

  toggleDoubledMode: function() {
    this.nodes.buttonD.classList.toggle('selected');
    this.nodes.window.classList.toggle('doubled');
  },

  close: function() {
    this.nodes.window.classList.add('closed');
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

  updateTitle: function() {
    var duration = this._timeString(this.winamp.getDuration());
    var name = this.winamp.fileName + ' (' + duration + ')  ***  ';
    this.winamp.dispatch({type: 'SET_MARQUEE_REGISTER', register: 'songTitle', text: name});
  },

  updateChannelCount: function() {
    var channels = this.winamp.getChannelCount();
    this.nodes.mono.classList.remove('selected');
    this.nodes.stereo.classList.remove('selected');
    if (channels === 1) {
      this.nodes.mono.classList.add('selected');
    } else if (channels === 2) {
      this.nodes.stereo.classList.add('selected');
    }
  },

  toggleRepeat: function() {
    this.nodes.repeat.classList.toggle('selected');
  },

  toggleShuffle: function() {
    this.nodes.shuffle.classList.toggle('selected');
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
  },

  _timeString: function(time) {
    var timeObject = this.winamp._timeObject(time);
    return timeObject[0] + timeObject[1] + ':' + timeObject[2] + timeObject[3];
  }
};
