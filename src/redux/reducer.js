import { CHUNK_SIZE, UPLOAD_PAGE } from "../constants";

const defaultState = {
  searchQuery: null,
  loadingSearchResults: false,
  selectedSkinPosition: null,
  matchingSkins: null,
  defaultSkins: [],
  selectedSkinHash: null,
  skinZip: null,
  focusedSkinFile: null,
  fileExplorerOpen: false,
  debugViewOpen: false,
  uploadViewOpen: false,
  areDragging: false,
  activeContentPage: null,
  totalNumberOfSkins: null,
  scale: 0.5,
  skins: {},
  showNsfw: false,
  fileUploads: {},
  showFeedbackForm: false,
};

function setUploadFileStatus(state, id, status, invalid) {
  const previousFile = state.fileUploads[id];
  return {
    ...state,
    fileUploads: {
      ...state.fileUploads,
      [id]: {
        ...previousFile,
        status: status,
        invalid: invalid ?? previousFile.invalid,
      },
    },
  };
}

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case "SET_DRAGGING":
      return { ...state, areDragging: action.dragging };
    case "SET_SCALE": {
      return { ...state, scale: action.scale };
    }
    case "GOT_FILES": {
      return { ...state, activeContentPage: UPLOAD_PAGE };
    }
    case "GOT_FILE": {
      return {
        ...state,
        fileUploads: {
          ...state.fileUploads,
          [action.id]: {
            file: action.file,
            id: action.id,
            status: "NEW",
            invalid: false,
          },
        },
      };
    }
    case "INVALID_FILE_EXTENSION": {
      return setUploadFileStatus(
        state,
        action.id,
        "INVALID_FILE_EXTENSION",
        true
      );
    }
    case "GOT_SKIN_TYPE": {
      const previousFile = state.fileUploads[action.id];
      return {
        ...state,
        fileUploads: {
          ...state.fileUploads,
          [action.id]: {
            ...previousFile,
            skinType: action.skinType,
          },
        },
      };
    }
    case "STARTING_FILE_UPLOAD": {
      return setUploadFileStatus(state, action.id, "UPLOADING");
    }
    case "UPLOAD_FAILED": {
      return setUploadFileStatus(state, action.id, "UPLOAD_FAILED", true);
    }
    case "UPLOAD_DELAYED": {
      return setUploadFileStatus(state, action.id, "UPLOAD_DELAYED", true);
    }
    case "ARCHIVED_SKIN": {
      return setUploadFileStatus(state, action.id, "ARCHIVED");
    }
    case "UPLOADED_SKIN": {
      return setUploadFileStatus(state, action.id, "UPLOADED");
    }
    case "INVALID_ARCHIVE":
      return setUploadFileStatus(state, action.id, "INVALID_ARCHIVE", true);
    case "GOT_FILE_MD5": {
      return {
        ...state,
        fileUploads: {
          ...state.fileUploads,
          [action.id]: {
            ...state.fileUploads[action.id],
            md5: action.md5,
          },
        },
      };
    }
    case "GOT_MISSING_AND_FOUND_MD5S": {
      const foundSet = new Set(action.found);

      function getNewFile(file) {
        if (file.md5 != null) {
          const uploadData = action.missing[file.md5];
          if (uploadData != null) {
            return {
              ...file,
              status: "MISSING",
              uploadUrl: uploadData.url,
              uploadId: uploadData.id,
            };
          } else if (foundSet.has(file.md5)) {
            return { ...file, status: "FOUND" };
          }
        }
        return file;
      }
      const newFileUploads = {};
      Object.entries(state.fileUploads).forEach(([key, file]) => {
        newFileUploads[key] = getNewFile(file);
      });
      return {
        ...state,
        fileUploads: newFileUploads,
      };
    }
    case "CLOSE_UPLOAD_FILES": {
      return {
        ...state,
        activeContentPage: null,
        fileUploads: {},
      };
    }
    case "TOGGLE_UPLOAD_VIEW": {
      return { ...state, uploadViewOpen: !state.uploadViewOpen };
    }
    case "CONCENTS_TO_NSFW": {
      return { ...state, showNsfw: true };
    }
    case "GOT_SKIN_DATA": {
      return {
        ...state,
        skins: { ...state.skins, [action.hash]: action.data },
      };
    }
    case "MARK_NSFW": {
      const skin = state.skins[action.hash];
      return {
        ...state,
        skins: { ...state.skins, [action.hash]: { ...skin, nsfw: true } },
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
        newSkins[skin.md5] = {
          // Spread in the old skin here, since we may have already gotten filename data about the skin.
          ...state.skins[skin.md5],
          ...skin,
        };
        // TODO: Do this with splice
        // TODO: Get chunk size from state
        // TODO: validate the chunk number is in bounds
        // TODO: validate that we don't alredy have this chunk
        newDefaultSkins[action.chunk * CHUNK_SIZE + i] = skin.md5;
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
        focusedSkinFile: null,
        fileExplorerOpen: false,
        debugViewOpen: false,
        showFeedbackForm: false,
      };
    case "SEARCH_QUERY_CHANGED":
      return {
        ...state,
        loadingSearchResults: true,
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
        loadingSearchResults: false,
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
    case "REQUESTED_PAGE":
      return {
        ...state,
        activeContentPage: action.page,
      };
    case "OPEN_FILE_EXPLORER":
      return {
        ...state,
        fileExplorerOpen: true,
      };
    case "TOGGLE_FILE_EXPLORER":
      return {
        ...state,
        fileExplorerOpen: !state.fileExplorerOpen,
      };
    case "CLOSE_FILE_EXPLORER":
      return {
        ...state,
        fileExplorerOpen: false,
      };
    case "SHOW_FEEDBACK_FORM":
      return {
        ...state,
        showFeedbackForm: true,
      };
    case "CLOSE_FEEDBACK_FORM":
      return {
        ...state,
        showFeedbackForm: false,
      };
    case "TOGGLE_DEBUG_VIEW":
      return {
        ...state,
        debugViewOpen: !state.debugViewOpen,
      };
    default:
      return state;
  }
}
