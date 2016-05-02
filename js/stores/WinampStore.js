var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var WinampConstants = require('../constants/WinampConstants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var _winamp = {
  windows: {
    main: {
      offset: {left: 0, top: 0}
    }
  },
  marqueeStep: 0,
  marqueeMessage: 'Hello Jordan! How is your day going? BAM!',
  visualizationColors: [],
  contextMenuOpen: false,
  position: 0,
  secondsElapsed: 0,
  playing: false,
  loading: false,
  balance: 0,
  volume: 50,
  mediaName: '',
  mediaFile: null,
  mediaChannels: 2,
  doubled: false,
  closed: false,
  shade: false,
  shuffle: false,
  repeat: false
};

var marqueeWidth = 30;

var WinampStore = assign({}, EventEmitter.prototype, {
  get: function() {
    return _winamp;
  },
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {

  switch (action.actionType) {
    case WinampConstants.SET_VISUALIZATION_COLORS:
      _winamp.visualizationColors = action.colors;
      WinampStore.emitChange();
      break;
    case WinampConstants.PLAY:
      _winamp.playing = true;
      WinampStore.emitChange();
      break;
    case WinampConstants.PAUSE:
      _winamp.playing = false;
      WinampStore.emitChange();
      break;
    case WinampConstants.STOP:
      _winamp.playing = false;
      _winamp.position = 0;
      _winamp.secondsElapsed = 0;
      _winamp.secondsRemaining = 0;
      WinampStore.emitChange();
      break;
    case WinampConstants.SET_POSITION:
      _winamp.position = action.position;
      _winamp.secondsElapsed = action.secondsElapsed;
      _winamp.secondsRemaining = action.secondsRemaing;
      WinampStore.emitChange();
      break;
    case WinampConstants.SET_BALANCE:
      var balance = action.value;
      if (Math.abs(balance) < 25) {
        // Snap to center
        balance = 0;
      }
      _winamp.balance = balance;
      WinampStore.emitChange();
      break;
    case WinampConstants.SET_VOLUME:
      _winamp.volume = action.value;
      WinampStore.emitChange();
      break;
    case WinampConstants.LOAD_FILE:
      if (action.file.type === 'audio/mp3') {
        _winamp.mediaName = action.file.name;
        _winamp.mediaFile = action.file;
      } else {
      }
      WinampStore.emitChange();
      break;
    case WinampConstants.TOGGLE_CONTEXT_MENU:
      _winamp.contextMenuOpen = !_winamp.contextMenuOpen;
      WinampStore.emitChange();
      break;
    case WinampConstants.TOGGLE_DOUBLE:
      _winamp.doubled = !_winamp.doubled;
      WinampStore.emitChange();
      break;
    case WinampConstants.TOGGLE_SHADE:
      _winamp.shade = !_winamp.shade;
      WinampStore.emitChange();
      break;
    case WinampConstants.TOGGLE_SHUFFLE:
      _winamp.shuffle = !_winamp.shuffle;
      WinampStore.emitChange();
      break;
    case WinampConstants.TOGGLE_REPEAT:
      _winamp.repeat = !_winamp.repeat;
      WinampStore.emitChange();
      break;
    case WinampConstants.CLOSE:
      _winamp.closed = true;
      _winamp.playing = false;
      WinampStore.emitChange();
      break;
    case WinampConstants.MOVE_MAIN_WINDOW:
      _winamp.windows.main.left = action.left;
      _winamp.windows.main.top = action.top;
      WinampStore.emitChange();
      break;
    case WinampConstants.STEP_MARQUEE:
      _winamp.marqueeStep = (_winamp.marqueeStep + 1) % marqueeWidth;
      WinampStore.emitChange();
      break;
    case WinampConstants.MEDIA_IS_LOADING:
      _winamp.loading = true;
      WinampStore.emitChange();
      break;
    case WinampConstants.MEDIA_LOADED:
        console.log('LOADED');
      _winamp.loading = false;
      WinampStore.emitChange();
      break;
    default:
      // no op
  }
});

module.exports = WinampStore;
