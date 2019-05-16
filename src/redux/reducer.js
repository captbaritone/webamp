import skinChunkData from "../skinData/skins.json";
import firstSkinChunk from "../skinData/skins-0.json";
import { ABOUT_PAGE } from "../constants";

const skins = {};
firstSkinChunk.forEach(skin => {
  skins[skin.md5] = skin;
});

const defaultState = {
  searchQuery: null,
  selectedSkinPosition: null,
  matchingHashes: null,
  selectedSkinHash: null,
  skinZip: null,
  focusedSkinFile: null,
  fileExplorerOpen: false,
  activeContentPage: null,
  skins,
  skinChunkData
};

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case "SELECTED_SKIN":
      return {
        ...state,
        selectedSkinHash: action.hash,
        selectedSkinPosition: action.position,
        skinZip: null,
        focusedSkinFile: null
      };
    case "CLOSE_MODAL":
      return {
        ...state,
        selectedSkinHash: null,
        selectedSkinPosition: null,
        skinZip: null,
        activeContentPage: null
      };
    case "SEARCH_QUERY_CHANGED":
      return {
        ...state,
        searchQuery: action.query,
        selectedSkinHash: null,
        selectedSkinPosition: null,
        focusedSkinFile: null
      };
    case "GOT_NEW_MATCHING_HASHES":
      return {
        ...state,
        matchingHashes: action.matchingHashes
      };
    case "LOADED_SKIN_ZIP":
      return {
        ...state,
        skinZip: action.zip
      };
    case "SELECTED_SKIN_FILE_TO_FOCUS": {
      return {
        ...state,
        focusedSkinFile: {
          content: null,
          ext: action.ext,
          fileName: action.fileName
        }
      };
    }
    case "GOT_FOCUSED_SKIN_FILE":
      return {
        ...state,
        focusedSkinFile: {
          ...state.focusedSkinFile,
          content: action.content
        }
      };
    case "REQUESTED_ABOUT_PAGE":
      return {
        ...state,
        activeContentPage: ABOUT_PAGE
      };
    case "OPEN_FILE_EXPLORER":
      return {
        ...state,
        fileExplorerOpen: true
      };
    case "CLOSE_FILE_EXPLORER":
      return {
        ...state,
        fileExplorerOpen: false
      };
    default:
      return state;
  }
}
