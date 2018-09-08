import {DisplayState, Action } from "../types";
import { createSelector } from "reselect";

import {
  CLOSE_WINAMP,
  SET_SKIN_DATA,
  START_WORKING,
  STEP_MARQUEE,
  STOP_WORKING,
  TOGGLE_DOUBLESIZE_MODE,
  TOGGLE_LLAMA_MODE,
  TOGGLE_VISUALIZER_STYLE,
  SET_PLAYLIST_SCROLL_POSITION,
  LOADED,
  REGISTER_VISUALIZER,
  SET_Z_INDEX,
  DISABLE_MARQUEE,
  SET_DUMMY_VIZ_DATA,
  LOADING
} from "../actionTypes";
import { DEFAULT_SKIN, VISUALIZER_ORDER } from "../constants";

export const getVisualizationOrder = (state: DisplayState): Array<string> => {
  return [...state.additionalVisualizers, ...VISUALIZER_ORDER];
};

export const getVisualizerStyle = createSelector(
  getVisualizationOrder,
  state => state.visualizerStyle,
  (visualizationOrder, visualizationStyle) => {
    return visualizationOrder[visualizationStyle];
  }
);

const defaultDisplayState = {
  doubled: false,
  marqueeStep: 0,
  disableMarquee: false,
  loading: true,
  llama: false,
  closed: false,
  working: false,
  skinImages: DEFAULT_SKIN.images,
  skinColors: DEFAULT_SKIN.colors,
  skinCursors: null,
  skinPlaylistStyle: null,
  skinRegion: {},
  visualizerStyle: 0, // Index into VISUALIZER_ORDER
  dummyVizData: null,
  playlistScrollPosition: 0,
  skinGenLetterWidths: null, // TODO: Get the default value for this?
  additionalVisualizers: [],
  zIndex: 0
};

const display = (state: DisplayState = defaultDisplayState, action: Action): DisplayState => {
  switch (action.type) {
    case TOGGLE_DOUBLESIZE_MODE:
      return { ...state, doubled: !state.doubled };
    case TOGGLE_LLAMA_MODE:
      return { ...state, llama: !state.llama };
    case STEP_MARQUEE:
      return state.disableMarquee
        ? state
        : { ...state, marqueeStep: state.marqueeStep + 1 };
    case DISABLE_MARQUEE:
      return { ...state, disableMarquee: true };
    case STOP_WORKING:
      return { ...state, working: false };
    case START_WORKING:
      return { ...state, working: true };
    case CLOSE_WINAMP:
      return { ...state, closed: true };
    case LOADING:
      return { ...state, loading: true };
    case LOADED:
      return { ...state, loading: false };
    case SET_SKIN_DATA:
    const {data} = action;
      return {
        ...state,
        loading: false,
        skinImages: data.skinImages,
        skinColors: data.skinColors,
        skinPlaylistStyle: data.skinPlaylistStyle,
        skinCursors: data.skinCursors,
        skinRegion: data.skinRegion,
        skinGenLetterWidths: data.skinGenLetterWidths
      };
    case TOGGLE_VISUALIZER_STYLE:
      return {
        ...state,
        visualizerStyle:
          (state.visualizerStyle + 1) % getVisualizationOrder(state).length
      };
    case REGISTER_VISUALIZER:
      return {
        ...state,
        additionalVisualizers: [action.id, ...state.additionalVisualizers]
      };
    case SET_PLAYLIST_SCROLL_POSITION:
      return { ...state, playlistScrollPosition: action.position };
    case SET_Z_INDEX:
      return { ...state, zIndex: action.zIndex };
    case SET_DUMMY_VIZ_DATA:
      return { ...state, dummyVizData: action.data };
    default:
      return state;
  }
};
export default display;
