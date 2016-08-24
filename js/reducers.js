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

const windows = (state, action) => {
  if (!state) {
    return {
      focused: 'MAIN'
    };
  }
  switch (action.type) {
    case 'SET_FOCUSED_WINDOW':
      return {...state, focused: action.window};
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

const equalizer = (state, action) => {
  if (!state) {
    return {
      on: false,
      auto: false,
      sliders: {
        preamp: 50,
        band60: 50,
        band170: 50,
        band310: 50,
        band600: 50,
        band1k: 50,
        band3k: 50,
        band6k: 50,
        band12k: 50,
        band14k: 50,
        band16k: 50
      }
    };
  }
  switch (action.type) {
    case 'SET_BAND_VALUE':
      const newSliders = {...state.sliders};
      newSliders[action.band] = action.value;
      return {...state, sliders: newSliders};
    case 'TOGGLE_EQ_ON':
      return {...state, on: !state.on};
    case 'TOGGLE_EQ_AUTO':
      return {...state, auto: !state.auto};
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
    case 'SET_MEDIA':
      return {
        ...state,
        length: action.length,
        kbps: action.kbps,
        khz: action.khz,
        channels: action.channels,
        name: action.name
      };
    case 'SET_VOLUME':
      return {...state, volume: action.volume};
    case 'SET_BALANCE':
      return {...state, balance: action.balance};
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
  windows,
  display,
  contextMenu,
  equalizer,
  media
});

export default reducer;
