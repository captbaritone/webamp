// UI and App logic
import Media from './media';
import MyFile from './myFile';
import {setSkinFromUrl, setSkinFromFile} from './actionCreators';

import '../css/winamp.css';

module.exports = {
  media: Media.init(),
  init: function(options) {
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.style.display = 'none';

    this.dispatch({type: 'SET_VOLUME', volume: options.volume});
    this.dispatch({type: 'SET_BALANCE', balance: options.balance});
    this.loadFromUrl(options.mediaFile.url, options.mediaFile.name);
    this.dispatch(setSkinFromUrl(options.skinUrl));
    this._registerListeners();
    return this;
  },

  _registerListeners: function() {
    this.media.addEventListener('timeupdate', () => {
      this.dispatch({type: 'UPDATE_TIME_ELAPSED', elapsed: this.media.timeElapsed()});
    });

    this.media.addEventListener('ended', () => {
      this.dispatch({type: 'SET_MEDIA_STATUS', status: 'STOPPED'});
    });

    this.media.addEventListener('waiting', () => {
      this.dispatch({type: 'START_WORKING'});
    });

    this.media.addEventListener('stopWaiting', () => {
      this.dispatch({type: 'STOP_WORKING'});
    });

    this.fileInput.onchange = (e) => {
      this.loadFromFileReference(e.target.files[0]);
    };
  },

  /* Functions */
  seekToPercentComplete: function(percent) {
    this.media.seekToPercentComplete(percent);
  },

  // From -100 to 100
  setBalance: function(balance) {
    this.media.setBalance(balance);
  },

  seekForwardBy: function(seconds) {
    this.media.seekToTime(this.media.timeElapsed() + seconds);
  },

  toggleRepeat: function() {
    this.media.toggleRepeat();
  },

  toggleShuffle: function() {
    this.media.toggleShuffle();
  },

  close: function() {
    this.media.stop();
  },

  openFileDialog: function() {
    this.fileInput.click();
  },

  loadFromFileReference: function(fileReference) {
    const file = new MyFile();
    file.setFileReference(fileReference);
    if (new RegExp('(wsz|zip)$', 'i').test(fileReference.name)) {
      this.dispatch(setSkinFromFile(file));
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

  /* Listeners */
  _loadBuffer: function(buffer) {
    function setMetaData() {
      const kbps = '128';
      const khz = Math.round(this.media.sampleRate() / 1000).toString();
      this.dispatch({type: 'SET_MEDIA_KBPS', kbps: kbps});
      this.dispatch({type: 'SET_MEDIA_KHZ', khz: khz});
      this.dispatch({type: 'SET_CHANNELS_COUNT', channels: this.media.channels()});
      this.dispatch({type: 'SET_MEDIA_NAME', name: this.fileName});
      this.dispatch({type: 'SET_MEDIA_LENGTH', length: this.media.duration()});
    }

    // Note, this will not happen right away
    this.media.loadBuffer(buffer, setMetaData.bind(this));
  }
};
