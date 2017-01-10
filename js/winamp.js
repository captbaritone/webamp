// UI and App logic
import Media from './media';
import MyFile from './myFile';
import {
  setSkinFromUrl,
  setSkinFromFile,
  setVolume,
  setPreamp,
  setBalance
} from './actionCreators';

import {SET_MEDIA} from './actionTypes';

import '../css/winamp.css';

module.exports = {
  media: Media.init(),
  init: function(options) {
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.style.display = 'none';

    this.dispatch(setVolume(options.volume));
    this.dispatch(setBalance(options.balance));
    this.dispatch(setPreamp(this.media, 50));
    this.loadFromUrl(options.mediaFile.url, options.mediaFile.name);
    this.dispatch(setSkinFromUrl(options.skinUrl));

    this.fileInput.onchange = (e) => {
      this.loadFromFileReference(e.target.files[0]);
    };
    return this;
  },

  /* Functions */
  seekToPercentComplete: function(percent) {
    this.media.seekToPercentComplete(percent);
  },

  seekForwardBy: function(seconds) {
    this.media.seekToTime(this.media.timeElapsed() + seconds);
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
      this.dispatch({
        type: SET_MEDIA,
        kbps: '128',
        khz: Math.round(this.media.sampleRate() / 1000).toString(),
        channels: this.media.channels(),
        name: this.fileName,
        length: this.media.duration()
      });
    }

    // Note, this will not happen right away
    this.media.loadBuffer(buffer, setMetaData.bind(this));
  }
};
