import React from 'react';
import Marquee from './Marquee.jsx';
import Actions from './Actions.jsx';
import Time from './Time.jsx';
import ShadeTime from './ShadeTime.jsx';

import '../css/main-window.css';

module.exports = {
  init: function(winamp) {
    this.winamp = winamp;
    this.nodes = {
      close: document.getElementById('close'),
      shade: document.getElementById('shade'),
      buttonD: document.getElementById('button-d'),
      position: document.getElementById('position'),
      volumeMessage: document.getElementById('volume-message'),
      balanceMessage: document.getElementById('balance-message'),
      positionMessage: document.getElementById('position-message'),
      visualizer: document.getElementById('visualizer'),
      eject: document.getElementById('eject'),
      repeat: document.getElementById('repeat'),
      shuffle: document.getElementById('shuffle'),
      volume: document.getElementById('volume'),
      kbps: document.getElementById('kbps'),
      khz: document.getElementById('khz'),
      mono: document.getElementById('mono'),
      stereo: document.getElementById('stereo'),
      balance: document.getElementById('balance'),
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

    this.nodes.position.onmousedown = function() {
      if (!self.nodes.window.classList.contains('stop')){
        self.winamp.dispatch({type: 'SHOW_MARQUEE_REGISTER', register: 'position'});
        self.nodes.window.classList.add('setting-position');
      }
    };

    this.nodes.position.onmouseup = function() {
      self.winamp.dispatch({type: 'SHOW_MARQUEE_REGISTER', register: 'songTitle'});
      self.nodes.window.classList.remove('setting-position');
    };

    this.nodes.position.oninput = function() {
      var newPercentComplete = self.nodes.position.value;
      var newFractionComplete = newPercentComplete / 100;
      var newElapsed = self._timeString(self.winamp.getDuration() * newFractionComplete);
      var duration = self._timeString(self.winamp.getDuration());
      var message = 'Seek to: ' + newElapsed + '/' + duration + ' (' + newPercentComplete + '%)';
      self.winamp.dispatch({type: 'SET_MARQUEE_REGISTER', register: 'message', text: message});
    };

    this.nodes.position.onchange = function() {
      if (self.winamp.getState() !== 'stop'){
        self.winamp.seekToPercentComplete(this.value);
      }
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

    this.nodes.volume.onmousedown = function() {
      self.winamp.dispatch({type: 'SHOW_MARQUEE_REGISTER', register: 'volume'});
    };

    this.nodes.volume.onmouseup = function() {
      self.winamp.dispatch({type: 'SHOW_MARQUEE_REGISTER', register: 'songTitle'});
    };

    this.nodes.volume.oninput = function() {
      self.winamp.setVolume(this.value);
    };

    this.nodes.balance.onmousedown = function() {
      self.winamp.dispatch({type: 'SHOW_MARQUEE_REGISTER', register: 'balance'});
    };

    this.nodes.balance.onmouseup = function() {
      self.winamp.dispatch({type: 'SHOW_MARQUEE_REGISTER', register: 'songTitle'});
    };

    this.nodes.balance.oninput = function() {
      if (Math.abs(this.value) < 25) {
        this.value = 0;
      }
      self.winamp.setBalance(this.value);
    };

    this.nodes.visualizer.onclick = function() {
      self.winamp.toggleVisualizer();
    };

    window.addEventListener('timeUpdated', function() {
      self.updateTime();
    });
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
    window.addEventListener('volumeChanged', function() {
      self.updateVolume();
    });
    window.addEventListener('balanceChanged', function() {
      self.setBalance();
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

  updatePosition: function() {
    if (!this.nodes.window.classList.contains('setting-position')) {
      this.nodes.position.value = this.winamp.getPercentComplete();
    }
  },

  // In shade mode, the position slider shows up differently depending on if
  // it's near the start, middle or end of its progress
  updateShadePositionClass: function() {
    var position = this.nodes.position;

    position.removeAttribute('class');
    if (position.value <= 33) {
      position.classList.add('left');
    } else if (position.value >= 66) {
      position.classList.add('right');
    }
  },

  updateTime: function() {
    this.updateShadePositionClass();
    this.updatePosition();
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

  updateVolume: function() {
    var volume = this.winamp.getVolume();
    var percent = volume / 100;
    var sprite = Math.round(percent * 28);
    var offset = (sprite - 1) * 15;
    this.nodes.volume.style.backgroundPosition = '0 -' + offset + 'px';

    var message = 'Volume: ' + volume + '%';
    this.winamp.dispatch({type: 'SET_MARQUEE_REGISTER', register: 'volume', text: message});

    // This shouldn't trigger an infinite loop with volume.onchange(),
    // since the value will be the same
    this.nodes.volume.value = volume;
  },

  setBalance: function() {
    var balance = this.winamp.getBalance();
    var string = '';
    if (balance === 0) {
      string = 'Balance: Center';
    } else if (balance > 0) {
      string = 'Balance: ' + balance + '% Right';
    } else {
      string = 'Balance: ' + Math.abs(balance) + '% Left';
    }
    this.winamp.dispatch({type: 'SET_MARQUEE_REGISTER', register: 'balance', text: string});
    balance = Math.abs(balance) / 100;
    var sprite = Math.round(balance * 28);
    var offset = (sprite - 1) * 15;
    this.nodes.balance.style.backgroundPosition = '0px -' + offset + 'px';
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
