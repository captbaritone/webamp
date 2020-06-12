import { ABOUT_PAGE } from "../constants";

const defaultState = {
  searchQuery: null,
  selectedSkinPosition: null,
  matchingSkins: null,
  defaultSkins: [],
  selectedSkinHash: null,
  skinZip: null,
  focusedSkinFile: null,
  fileExplorerOpen: false,
  activeContentPage: null,
  totalNumberOfSkins: null,
  skinChunkData: { chunkSize: 100, numberOfSkins: 64381, chunkFileNames: [] },
  skins: {},
};

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case "GOT_SKIN_DATA": {
      return {
        ...state,
        skins: { ...state.skins, [action.hash]: action.data },
      };
    }
    case "GOT_TOTAL_NUMBER_OF_SKINS": {
      if (state.totalNumberOfSkins === action.number) {
        return state;
      }
      return { ...state, totalNumberOfSkins: action.number };
    }
    case "GOT_SKIN_CHUNK": {
      const newSkins = { ...state.skins };
      const newDefaultSkins = [...state.defaultSkins];
      action.payload.forEach((skin, i) => {
        newSkins[skin.md5] = skin;
        // TODO: Do this with splice
        // TODO: Get chunk size from state
        // TODO: validate the chunk number is in bounds
        // TODO: validate that we don't alredy have this chunk
        newDefaultSkins[action.chunk * 100 + i] = skin.md5;
      });
      return {
        ...state,
        skins: newSkins,
        defaultSkins: newDefaultSkins,
      };
    }
    case "SELECTED_SKIN":
      return {
        ...state,
        selectedSkinHash: action.hash,
        selectedSkinPosition: action.position,
        skinZip: null,
        focusedSkinFile: null,
      };
    case "CLOSE_MODAL":
      return {
        ...state,
        selectedSkinHash: null,
        selectedSkinPosition: null,
        skinZip: null,
        activeContentPage: null,
      };
    case "SEARCH_QUERY_CHANGED":
      return {
        ...state,
        searchQuery: action.query,
        selectedSkinHash: null,
        selectedSkinPosition: null,
        focusedSkinFile: null,
      };
    case "GOT_NEW_MATCHING_SKINS":
      let newSkins = state.skins;
      if (action.skins != null) {
        newSkins = { ...state.skins };
        // Add skins to the cache
        action.skins.forEach((skin) => {
          if (newSkins[skin.hash] == null) {
            newSkins[skin.hash] = skin;
          }
        });
      }
      return {
        ...state,
        matchingSkins: action.skins,
        skins: newSkins,
      };
    case "LOADED_SKIN_ZIP":
      return {
        ...state,
        skinZip: action.zip,
      };
    case "SELECTED_SKIN_FILE_TO_FOCUS": {
      return {
        ...state,
        focusedSkinFile: {
          content: null,
          ext: action.ext,
          fileName: action.fileName,
        },
      };
    }
    case "GOT_FOCUSED_SKIN_FILE":
      return {
        ...state,
        focusedSkinFile: {
          ...state.focusedSkinFile,
          content: action.content,
        },
      };
    case "REQUESTED_ABOUT_PAGE":
      return {
        ...state,
        activeContentPage: ABOUT_PAGE,
      };
    case "OPEN_FILE_EXPLORER":
      return {
        ...state,
        fileExplorerOpen: true,
      };
    case "CLOSE_FILE_EXPLORER":
      return {
        ...state,
        fileExplorerOpen: false,
      };
    default:
      return state;
  }
}
