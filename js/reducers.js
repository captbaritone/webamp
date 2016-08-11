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
      marqueeStep: 0,
      loading: true,
      llama: false,
      closed: false,
      shade: false,
      working: false,
      skinCss: null,
      skinColors: null,
      skinPlaylistStyle: {},
      visualizerStyle: 2
    };
  }
  switch (action.type) {
    case 'TOGGLE_DOUBLESIZE_MODE':
      return {...state, doubled: !state.doubled};
    case 'TOGGLE_SHADE_MODE':
      return {...state, shade: !state.shade};
    case 'TOGGLE_LLAMA_MODE':
      return {...state, llama: !state.llama};
    case 'STEP_MARQUEE':
      // TODO: Prevent this from becoming huge
      return {...state, marqueeStep: state.marqueeStep + 1};
    case 'STOP_WORKING':
      return {...state, working: false};
    case 'START_WORKING':
      return {...state, working: true};
    case 'START_LOADING':
      return {...state, loading: true};
    case 'CLOSE_WINAMP':
      return {...state, closed: true};
    case 'SET_SKIN_DATA':
      return {
        ...state,
        loading: false,
        skinCss: action.skinCss,
        skinColors: action.skinColors,
        skinPlaylistStyle: action.skinPlaylistStyle
      };
    case 'TOGGLE_VISUALIZER_STYLE':
      return {...state, visualizerStyle: (state.visualizerStyle + 1) % 3};
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
      repeat: false,
      // TODO: Enforce possible values
      status: 'STOPPED'
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
    case 'SET_MEDIA_STATUS':
      return {...state, status: action.status};
    default:
      return state;
  }
};

const reducer = combineReducers({
  userInput,
  display,
  contextMenu,
  media
});

export default reducer;
