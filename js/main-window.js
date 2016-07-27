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
import MonoStereo from './MonoStereo.jsx';
import Repeat from './Repeat.jsx';
import Shuffle from './Shuffle.jsx';

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
    this.winamp.renderTo(<MonoStereo />, document.getElementById('mono-stereo-holder'));
    this.winamp.renderTo(<Repeat />, document.getElementById('repeat-holder'));
    this.winamp.renderTo(<Shuffle />, document.getElementById('shuffle-holder'));

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
      self.winamp.dispatch({type: 'SET_FOCUS', input: 'double'});
    };

    this.nodes.buttonD.onmouseup = function() {
      self.winamp.dispatch({type: 'TOGGLE_DOUBLESIZE_MODE'});
      self.winamp.dispatch({type: 'UNSET_FOCUS'});
    };

    this.nodes.eject.onclick = function() {
      self.winamp.dispatch({type: 'OPEN_FILE_DIALOG'});
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
