import MyFile from './my-file';
import {combineReducers} from 'redux';

const userInput = (state, action) => {
  if (!state) {
    return {
      focus: null,
      scrubPosition: 0
    };
  }
  switch (action.type) {
    case 'SET_FOCUS':
      return {...state, focus: action.input};
    case 'UNSET_FOCUS':
      return {...state, focus: null};
    case 'SET_SCRUB_POSITION':
      return {...state, scrubPosition: action.position};
    default:
      return state;
  }
};

const display = (state, action) => {
  if (!state) {
    return {
      doubled: false,
      marqueeStep: 0
    };
  }
  switch (action.type) {
    case 'TOGGLE_DOUBLESIZE_MODE':
      return {...state, doubled: !state.doubled};
    case 'STEP_MARQUEE':
      // TODO: Prevent this from becoming huge
      return {...state, marqueeStep: state.marqueeStep + 1};
    default:
      return state;
  }
};

const contextMenu = (state, action) => {
  if (!state) {
    return {
      selected: false
    };
  }
  switch (action.type) {
    case 'TOGGLE_CONTEXT_MENU':
      return {...state, selected: !state.selected};
    case 'CLOSE_CONTEXT_MENU':
      return {...state, selected: false};
    default:
      return state;
  }
};

const media = (state, action) => {
  if (!state) {
    return {
      timeMode: 'ELAPSED',
      timeElapsed: 0,
      length: null, // Consider renaming to "duration"
      kbps: null,
      khz: null,
      volume: 50,
      balance: 0,
      name: '',
      channels: null,
      shuffle: false,
      repeat: false
    };
  }
  switch (action.type) {
    case 'TOGGLE_TIME_MODE':
      const newMode = state.timeMode === 'REMAINING' ? 'ELAPSED' : 'REMAINING';
      return {...state, timeMode: newMode};
    case 'UPDATE_TIME_ELAPSED':
      return {...state, timeElapsed: action.elapsed};
    case 'SET_MEDIA_LENGTH':
      return {...state, length: action.length};
    case 'SET_MEDIA_KBPS':
      return {...state, kbps: action.kbps};
    case 'SET_MEDIA_KHZ':
      return {...state, khz: action.khz};
    case 'SET_VOLUME':
      return {...state, volume: action.volume};
    case 'SET_BALANCE':
      return {...state, balance: action.balance};
    case 'SET_MEDIA_NAME':
      return {...state, name: action.name};
    case 'SET_CHANNELS_COUNT':
      return {...state, channels: action.channels};
    case 'TOGGLE_REPEAT':
      return {...state, repeat: !state.repeat};
    case 'TOGGLE_SHUFFLE':
      return {...state, shuffle: !state.shuffle};
    default:
      return state;
  }
};

const createReducer = (winamp) => {

  const reducer = combineReducers({
    userInput,
    display,
    contextMenu,
    media
  });

  // Add in the temporary actions that don't modify the state.
  return (state, action) => {
    state = reducer(state, action);
    switch (action.type) {
      case 'PLAY':
        winamp.play();
        return state;
      case 'PAUSE':
        winamp.pause();
        return state;
      case 'STOP':
        winamp.stop();
        return state;
      case 'SET_VOLUME':
        winamp.setVolume(action.volume);
        return state;
      case 'SET_BALANCE':
        winamp.setBalance(action.balance);
        return state;
      case 'SET_POSITION':
        winamp.seekToPercentComplete(action.position);
        return state;
      case 'CLOSE_WINAMP':
        winamp.close();
        return state;
      case 'OPEN_FILE_DIALOG':
        // TODO: Figure out how to make this pure
        winamp.openFileDialog();
        return state;
      case 'SET_SKIN_FROM_URL':
        // TODO: Figure out how to make this pure
        const skinFile = new MyFile();
        skinFile.setUrl(action.url);
        winamp.setSkin(skinFile);
        return state;
      case 'TOGGLE_DOUBLESIZE_MODE':
        winamp.toggleDoubledMode();
        return state;
      case 'TOGGLE_REPEAT':
        winamp.toggleRepeat();
        return state;
      case 'TOGGLE_SHUFFLE':
        winamp.toggleShuffle();
        return state;
      default:
        return state;
    }
  };
};

export default createReducer;
