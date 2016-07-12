// UI and App logic
import MainWindow from './main-window';
import WindowManager from './window-manager';
import Skin from './skin';
import Media from './media';
import MyFile from './my-file';

import '../css/winamp.css';

module.exports = {
  init: function(options) {
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.style.display = 'none';

    this.windowManager = WindowManager;
    this.media = Media.init();
    this.skin = Skin.init(document.getElementById('visualizer'), this.media._analyser);
    this.state = '';

    this.mainWindow = MainWindow.init(this);

    this.events = {
      timeUpdated: new Event('timeUpdated'),
      startWaiting: new Event('startWaiting'),
      stopWaiting: new Event('stopWaiting'),
      startLoading: new Event('startLoading'),
      stopLoading: new Event('stopLoading'),
      changeState: new Event('changeState'),
      titleUpdated: new Event('titleUpdated'),
      channelCountUpdated: new Event('channelCountUpdated'),
      volumeChanged: new Event('volumeChanged'),
      balanceChanged: new Event('balanceChanged'),
      doubledModeToggled: new Event('doubledModeToggled'),
      repeatToggled: new Event('repeatToggled'),
      llamaToggled: new Event('llamaToggled'),
      close: new Event('close')
    };

    this.setVolume(options.volume);
    this.setBalance(options.balance);
    this.loadFromUrl(options.mediaFile.url, options.mediaFile.name);
    var skinFile = new MyFile();
    skinFile.setUrl(options.skinUrl);
    this.setSkin(skinFile);

    this._registerListeners();
    return this;
  },

  _registerListeners: function() {
    var self = this;

    this.windowManager.registerWindow(this.mainWindow);

    this.media.addEventListener('timeupdate', function() {
      self.dispatch({type: 'UPDATE_TIME_ELAPSED', elapsed: self.media.timeElapsed()});
      // Legacy
      window.dispatchEvent(self.events.timeUpdated);
    });

    this.media.addEventListener('visualizerupdate', function(analyser) {
      self.skin.visualizer.paintFrame(self.visualizerStyle, analyser);
    });

    this.media.addEventListener('ended', function() {
      self.skin.visualizer.clear();
      self.setState('stop');
    });

    this.media.addEventListener('waiting', function() {
      window.dispatchEvent(self.events.startWaiting);
    });

    this.media.addEventListener('stopWaiting', function() {
      window.dispatchEvent(self.events.stopWaiting);
    });

    this.media.addEventListener('playing', function() {
      self.setState('play');
    });

    this.fileInput.onchange = function(e){
      self.loadFromFileReference(e.target.files[0]);
    };
  },

  /* Functions */
  setState: function(state) {
    this.state = state;
    window.dispatchEvent(this.events.changeState);
  },

  getState: function() {
    return this.state;
  },

  getDuration: function() {
    return this.media.duration();
  },

  getTimeRemaining: function() {
    return this.media.timeRemaining();
  },

  getTimeElapsed: function() {
    return this.media.timeElapsed();
  },

  getPercentComplete: function() {
    return this.media.percentComplete();
  },

  getChannelCount: function() {
    return this.media.channels();
  },

  getVolume: function() {
    return Math.round(this.media.getVolume() * 100);
  },

  seekToPercentComplete: function(percent) {
    this.media.seekToPercentComplete(percent);
  },

  play: function() {
    if (this.getState() === 'play'){
      this.media.stop();
    }
    this.media.play();
    this.setState('play');
  },

  pause: function() {
    if (this.getState() === 'pause'){
      this.media.play();
    } else if (this.getState() === 'play') {
      this.media.pause();
      this.setState('pause');
    }
  },
  stop: function() {
    this.media.stop();
    this.setState('stop');
  },

  // From 0-100
  setVolume: function(volume) {
    // Ensure volume does not go out of bounds
    volume = Math.max(volume, 0);
    volume = Math.min(volume, 100);

    var percent = volume / 100;

    this.media.setVolume(percent);
    window.dispatchEvent(this.events.volumeChanged);
  },

  incrementVolumeBy: function(ammount) {
    this.setVolume((this.media.getVolume() * 100) + ammount);
  },

  toggleDoubledMode: function() {
    window.dispatchEvent(this.events.doubledModeToggled);
  },

  // From -100 to 100
  setBalance: function(balance) {
    this.media.setBalance(balance);
    window.dispatchEvent(this.events.balanceChanged);
  },

  getBalance: function() {
    return this.media.getBalance();
  },

  seekForwardBy: function(seconds) {
    this.media.seekToTime(this.media.timeElapsed() + seconds);
    window.dispatchEvent(self.events.timeUpdated);
  },

  toggleRepeat: function() {
    this.media.toggleRepeat();
    window.dispatchEvent(this.events.repeatToggled);
  },

  toggleShuffle: function() {
    this.media.toggleShuffle();
    this.mainWindow.toggleShuffle();
  },

  toggleLlama: function() {
    window.dispatchEvent(this.events.llamaToggled);
  },

  close: function() {
    window.dispatchEvent(this.events.close);
    this.media.stop();
    this.setState('stop'); // Currently unneeded
  },

  openFileDialog: function() {
    this.fileInput.click();
  },

  loadFromFileReference: function(fileReference) {
    var file = new MyFile();
    file.setFileReference(fileReference);
    if (new RegExp('(wsz|zip)$', 'i').test(fileReference.name)) {
      this.skin.setSkinByFile(file);
    } else {
      this.media.autoPlay = true;
      this.fileName = fileReference.name;
      file.processBuffer(this._loadBuffer.bind(this));
    }
  },

  // Used only for the initial load, since it must have a CORS header
  loadFromUrl: function(url, fileName) {
    if (!fileName) {
      this.fileName = url.split('/').pop();
    } else {
      this.fileName = fileName;
    }
    var file = new MyFile();
    file.setUrl(url);
    file.processBuffer(this._loadBuffer.bind(this));
  },

  setSkin: function(file) {
    this.setLoadingState();
    this.skin.setSkinByFile(file, this.unsetLoadingState.bind(this));
  },

  setLoadingState: function() {
    window.dispatchEvent(this.events.startLoading);
  },

  unsetLoadingState: function() {
    window.dispatchEvent(this.events.stopLoading);
  },

  toggleVisualizer: function() {
    if (this.skin.visualizer.style === this.skin.visualizer.NONE) {
      this.skin.visualizer.setStyle(this.skin.visualizer.BAR);
    } else if (this.skin.visualizer.style === this.skin.visualizer.BAR) {
      this.skin.visualizer.setStyle(this.skin.visualizer.OSCILLOSCOPE);
    } else if (this.skin.visualizer.style === this.skin.visualizer.OSCILLOSCOPE) {
      this.skin.visualizer.setStyle(this.skin.visualizer.NONE);
    }
    this.skin.visualizer.clear();
  },

  /* Listeners */
  _loadBuffer: function(buffer) {
    function setMetaData() {
      var kbps = '128';
      var khz = Math.round(this.media.sampleRate() / 1000).toString();
      this.skin.font.setNodeToString(document.getElementById('kbps'), kbps);
      this.skin.font.setNodeToString(document.getElementById('khz'), khz);
      window.dispatchEvent(this.events.channelCountUpdated);
      window.dispatchEvent(this.events.titleUpdated);
      window.dispatchEvent(this.events.timeUpdated);
      this.dispatch({type: 'SET_MEDIA_LENGTH', length: this.media.duration()});
    }

    // Note, this will not happen right away
    this.media.loadBuffer(buffer, setMetaData.bind(this));
  },

  /* Helpers */
  _timeObject: function(time) {
    var minutes = Math.floor(time / 60);
    var seconds = time - (minutes * 60);

    return [
      Math.floor(minutes / 10),
      Math.floor(minutes % 10),
      Math.floor(seconds / 10),
      Math.floor(seconds % 10)
    ];
  }
};
