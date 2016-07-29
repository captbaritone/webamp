// UI and App logic
import Skin from './skin';
import Media from './media';
import MyFile from './my-file';

import '../css/winamp.css';

module.exports = {
  media: Media.init(),
  init: function(options) {
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.style.display = 'none';

    this.skin = Skin.init(document.getElementById('visualizer'), this.media._analyser);
    this.state = '';

    this.events = {
      timeUpdated: new Event('timeUpdated')
    };

    this.dispatch({type: 'SET_VOLUME', volume: options.volume});
    this.dispatch({type: 'SET_BALANCE', balance: options.balance});
    this.loadFromUrl(options.mediaFile.url, options.mediaFile.name);
    const skinFile = new MyFile();
    skinFile.setUrl(options.skinUrl);
    this.setSkin(skinFile);

    this._registerListeners();
    return this;
  },

  _registerListeners: function() {
    this.media.addEventListener('timeupdate', () => {
      this.dispatch({type: 'UPDATE_TIME_ELAPSED', elapsed: this.media.timeElapsed()});
      // Legacy
      window.dispatchEvent(this.events.timeUpdated);
    });

    this.media.addEventListener('visualizerupdate', (analyser) => {
      this.skin.visualizer.paintFrame(this.visualizerStyle, analyser);
    });

    this.media.addEventListener('ended', () => {
      this.skin.visualizer.clear();
      this.dispatch({type: 'MEDIA_IS_STOPPED'});
    });

    this.media.addEventListener('waiting', () => {
      this.dispatch({type: 'START_WORKING'});
    });

    this.media.addEventListener('stopWaiting', () => {
      this.dispatch({type: 'STOP_WORKING'});
    });

    this.media.addEventListener('playing', () => {
      this.dispatch({type: 'MEDIA_IS_PLAYING'});
    });

    this.fileInput.onchange = (e) => {
      this.loadFromFileReference(e.target.files[0]);
    };
  },

  /* Functions */
  seekToPercentComplete: function(percent) {
    this.media.seekToPercentComplete(percent);
  },

  // From 0-100
  setVolume: function(volume) {
    // Ensure volume does not go out of bounds
    volume = Math.max(volume, 0);
    volume = Math.min(volume, 100);

    this.media.setVolume(volume);
  },

  // From -100 to 100
  setBalance: function(balance) {
    this.media.setBalance(balance);
  },

  seekForwardBy: function(seconds) {
    this.media.seekToTime(this.media.timeElapsed() + seconds);
    window.dispatchEvent(this.events.timeUpdated);
  },

  toggleRepeat: function() {
    this.media.toggleRepeat();
  },

  toggleShuffle: function() {
    this.media.toggleShuffle();
  },

  close: function() {
    this.media.stop();
    this.dispatch({type: 'MEDIA_IS_STOPPED'});
  },

  openFileDialog: function() {
    this.fileInput.click();
  },

  loadFromFileReference: function(fileReference) {
    const file = new MyFile();
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
    const file = new MyFile();
    file.setUrl(url);
    file.processBuffer(this._loadBuffer.bind(this));
  },

  setSkin: function(file) {
    this.dispatch({type: 'START_LOADING'});
    this.skin.setSkinByFile(file, () => this.dispatch({type: 'STOP_LOADING'}));
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
      const kbps = '128';
      const khz = Math.round(this.media.sampleRate() / 1000).toString();
      this.dispatch({type: 'SET_MEDIA_KBPS', kbps: kbps});
      this.dispatch({type: 'SET_MEDIA_KHZ', khz: khz});
      this.dispatch({type: 'SET_CHANNELS_COUNT', channels: this.media.channels()});
      this.dispatch({type: 'SET_MEDIA_NAME', name: this.fileName});
      window.dispatchEvent(this.events.timeUpdated);
      this.dispatch({type: 'SET_MEDIA_LENGTH', length: this.media.duration()});
    }

    // Note, this will not happen right away
    this.media.loadBuffer(buffer, setMetaData.bind(this));
  }
};
