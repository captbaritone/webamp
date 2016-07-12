import MyFile from './my-file';
import {combineReducers} from 'redux';

const register = (state, action) => {
  if (!state) {
    return {
      id: '',
      step: 0,
      text: ''
    };
  }
  switch (action.type) {
    case 'SET_MARQUEE_REGISTER':
      if (state.id === action.register) {
        return Object.assign({}, state, {step: 0, text: action.text});
      }
      return state;
    case 'STEP_MARQUEE':
      return Object.assign({}, state, {step: (state.step + 1) % state.text.length});
    default:
      return state;
  }
};

const marquee = (state, action) => {
  if (!state) {
    return {
      stepping: true,
      selectedRegister: 'songTitle',
      registers: [
        Object.assign(register(), {id: 'songTitle'}),
        Object.assign(register(), {id: 'position'}),
        Object.assign(register(), {id: 'volume'}),
        Object.assign(register(), {id: 'balance'}),
        Object.assign(register(), {id: 'message'})
      ]
    };
  }
  switch (action.type) {
    case 'SET_MARQUEE_REGISTER':
      return Object.assign({}, state, {registers: state.registers.map(r => register(r, action))});
    case 'STEP_MARQUEE':
      if (state.stepping) {
        return Object.assign({}, state, {registers: state.registers.map(r => register(r, action))});
      }
      return state;
    case 'SHOW_MARQUEE_REGISTER':
      if (state.stepping) {
        return Object.assign({}, state, {selectedRegister: action.register});
      }
      return state;
    case 'PAUSE_MARQUEE':
      return Object.assign({}, state, {stepping: false});
    case 'START_MARQUEE':
      return Object.assign({}, state, {stepping: true});
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
      return Object.assign({}, state, {selected: !state.selected});
    case 'CLOSE_CONTEXT_MENU':
      return Object.assign({}, state, {selected: false});
    default:
      return state;
  }
};

const media = (state, action) => {
  if (!state) {
    return {
      timeMode: 'ELAPSED',
      timeElapsed: 0,
      length: null,
      kbps: null,
      khz: null
    };
  }
  switch (action.type) {
    case 'TOGGLE_TIME_MODE':
      const newMode = state.timeMode === 'REMAINING' ? 'ELAPSED' : 'REMAINING';
      return Object.assign({}, state, {timeMode: newMode});
    case 'UPDATE_TIME_ELAPSED':
      return Object.assign({}, state, {timeElapsed: action.elapsed});
    case 'SET_MEDIA_LENGTH':
      return Object.assign({}, state, {length: action.length});
    case 'SET_MEDIA_KBPS':
      return Object.assign({}, state, {kbps: action.kbps});
    case 'SET_MEDIA_KHZ':
      return Object.assign({}, state, {khz: action.khz});
    default:
      return state;
  }
};

const createReducer = (winamp) => {

  const reducer = combineReducers({
    marquee,
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
      default:
        return state;
    }
  };
};

export default createReducer;
