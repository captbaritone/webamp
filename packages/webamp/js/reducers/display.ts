import {
  Action,
  SkinImages,
  Cursors,
  SkinRegion,
  GenLetterWidths,
  PlaylistStyle,
  SkinGenExColors,
  DummyVizData,
} from "../types";
import * as Utils from "../utils";
import { createSelector } from "reselect";

import {
  CLOSE_WINAMP,
  OPEN_WINAMP,
  SET_SKIN_DATA,
  START_WORKING,
  STEP_MARQUEE,
  STOP_WORKING,
  TOGGLE_DOUBLESIZE_MODE,
  TOGGLE_LLAMA_MODE,
  TOGGLE_VISUALIZER_STYLE,
  SET_PLAYLIST_SCROLL_POSITION,
  LOADED,
  SET_Z_INDEX,
  DISABLE_MARQUEE,
  SET_DUMMY_VIZ_DATA,
  LOADING,
  LOAD_SERIALIZED_STATE,
  LOAD_DEFAULT_SKIN,
} from "../actionTypes";
import { DEFAULT_SKIN, VISUALIZER_ORDER } from "../constants";
import { DisplaySerializedStateV1 } from "../serializedStates/v1Types";

export interface DisplayState {
  visualizerStyle: number;
  doubled: boolean;
  llama: boolean;
  disableMarquee: boolean;
  marqueeStep: number;
  skinImages: SkinImages;
  skinCursors: Cursors | null;
  skinRegion: SkinRegion;
  skinGenLetterWidths: GenLetterWidths | null;
  skinColors: string[]; // Theoretically this could be a tuple of a specific length
  skinPlaylistStyle: PlaylistStyle | null;
  skinGenExColors: SkinGenExColors;
  working: boolean;
  closed: boolean;
  loading: boolean;
  playlistScrollPosition: number;
  zIndex: number;
  dummyVizData: DummyVizData | null;
}

const defaultSkinGenExColors = {
  itemBackground: "rgb(0,0,0)",
  itemForeground: "rgb(0,255,0)",
  windowBackground: "rgb(56,55,87)",
  buttonText: "rgb(57,57,66)",
  windowText: "rgb(255,255,255)",
  divider: "rgb(117,116,139)",
  playlistSelection: "rgb(0,0,198)",
  listHeaderBackground: "rgb(72,72,120)",
  listHeaderText: "rgb(255,255,255)",
  listHeaderFrameTopAndLeft: "rgb(108,108,180)",
  listHeaderFrameBottomAndRight: "rgb(36,36,60)",
  listHeaderFramePressed: "rgb(18,18,30)",
  listHeaderDeadArea: "rgb(36,36,60)",
  scrollbarOne: "rgb(36,36,60)",
  scrollbarTwo: "rgb(36,36,60)",
  pressedScrollbarOne: "rgb(121,130,150)",
  pressedScrollbarTwo: "rgb(78,88,110)",
  scrollbarDeadArea: "rgb(36,36,60)",
  listTextHighlighted: "rgb(0,198,255)",
  listTextHighlightedBackground: "rgb(0,198,255)",
  listTextSelected: "rgb(0,198,255)",
  listTextSelectedBackground: "rgb(0,198,255)",
};

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
  skinGenExColors: defaultSkinGenExColors,
  additionalVisualizers: [],
  zIndex: 0,
};

const display = (
  state: DisplayState = defaultDisplayState,
  action: Action
): DisplayState => {
  switch (action.type) {
    case LOAD_DEFAULT_SKIN: {
      const {
        skinImages,
        skinColors,
        skinCursors,
        skinPlaylistStyle,
        skinRegion,
        skinGenLetterWidths,
        skinGenExColors,
      } = defaultDisplayState;
      return {
        ...state,
        skinImages,
        skinColors,
        skinCursors,
        skinPlaylistStyle,
        skinRegion,
        skinGenLetterWidths,
        skinGenExColors,
      };
    }
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
    case OPEN_WINAMP:
      return { ...state, closed: false };
    case LOADING:
      return { ...state, loading: true };
    case LOADED:
      return { ...state, loading: false };
    case SET_SKIN_DATA:
      const { data } = action;
      return {
        ...state,
        loading: false,
        skinImages: data.skinImages,
        skinColors: data.skinColors,
        skinPlaylistStyle: data.skinPlaylistStyle,
        skinCursors: data.skinCursors,
        skinRegion: data.skinRegion,
        skinGenLetterWidths: data.skinGenLetterWidths,
        skinGenExColors: data.skinGenExColors || defaultSkinGenExColors,
      };
    case TOGGLE_VISUALIZER_STYLE:
      return {
        ...state,
        visualizerStyle: (state.visualizerStyle + 1) % VISUALIZER_ORDER.length,
      };
    case SET_PLAYLIST_SCROLL_POSITION:
      return { ...state, playlistScrollPosition: action.position };
    case SET_Z_INDEX:
      return { ...state, zIndex: action.zIndex };
    case SET_DUMMY_VIZ_DATA:
      return { ...state, dummyVizData: action.data };
    case LOAD_SERIALIZED_STATE: {
      const { skinCursors, ...rest } = action.serializedState.display;
      const upgrade = (url: string) => ({ type: "cur", url } as const);
      const newSkinCursors =
        skinCursors == null ? null : Utils.objectMap(skinCursors, upgrade);
      return { ...state, skinCursors: newSkinCursors, ...rest };
    }
    default:
      return state;
  }
};
export default display;

export const getSerializedState = (
  state: DisplayState
): DisplaySerializedStateV1 => {
  // My kingdom for a type-safe `_.pick`.
  const {
    visualizerStyle,
    doubled,
    llama,
    marqueeStep,
    skinImages,
    skinCursors,
    skinRegion,
    skinGenLetterWidths,
    skinColors,
    skinPlaylistStyle,
  } = state;

  let newCursors: { [cursor: string]: string } | null = null;
  if (skinCursors != null) {
    // @ts-ignore Typescript does not like that we can have `undefined` as
    // values here. Since this is going to get serialized to JSON (which will
    // drop undefined) it's fine.
    // This code is geting removed soon anyway.
    newCursors = Utils.objectMap(skinCursors, (cursor) => {
      return cursor.type === "cur" ? cursor.url : undefined;
    });
  }
  return {
    visualizerStyle,
    doubled,
    llama,
    marqueeStep,
    skinImages,
    skinCursors: newCursors,
    skinRegion,
    skinGenLetterWidths,
    skinColors,
    skinPlaylistStyle,
  };
};

export const getVisualizerStyle = createSelector(
  (state: DisplayState) => state.visualizerStyle,
  (visualizationStyle): string => {
    return VISUALIZER_ORDER[visualizationStyle];
  }
);
