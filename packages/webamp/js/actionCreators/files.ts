import { parser, creator } from "winamp-eqf";
import { BANDS, LOAD_STYLE } from "../constants";

import * as Utils from "../utils";

import {
  promptForFileReferences,
  genArrayBufferFromFileReference,
  genMediaDuration,
  genMediaTags,
} from "../fileUtils";
import skinParser from "../skinParser";
import {
  getTracks,
  getUserTracks,
  getTrackIsVisibleFunction,
  getEqfData,
  getPlaylistURL,
} from "../selectors";

import {
  ADD_TRACK_FROM_URL,
  PLAY_TRACK,
  BUFFER_TRACK,
  SET_MEDIA_TAGS,
  SET_MEDIA_DURATION,
  MEDIA_TAG_REQUEST_INITIALIZED,
  MEDIA_TAG_REQUEST_FAILED,
  SET_SKIN_DATA,
  LOADED,
  LOADING,
} from "../actionTypes";
import LoadQueue from "../loadQueue";

import { removeAllTracks } from "./playlist";
import { setPreamp, setEqBand } from "./equalizer";
import {
  LoadStyle,
  Thunk,
  Track,
  EqfPreset,
  SkinData,
  WindowId,
} from "../types";

// Lower is better
const DURATION_VISIBLE_PRIORITY = 5;
const META_DATA_VISIBLE_PRIORITY = 10;
const DURATION_PRIORITY = 15;
const META_DATA_PRIORITY = 20;

const loadQueue = new LoadQueue({ threads: 4 });

export function addTracksFromReferences(
  fileReferences: FileList,
  loadStyle: LoadStyle,
  atIndex: number | undefined
): Thunk {
  const tracks: Track[] = Array.from(fileReferences).map((file) => ({
    blob: file,
    defaultName: file.name,
  }));
  return loadMediaFiles(tracks, loadStyle, atIndex);
}

const SKIN_FILENAME_MATCHER = new RegExp("(wsz|zip)$", "i");
const EQF_FILENAME_MATCHER = new RegExp("eqf$", "i");
export function loadFilesFromReferences(
  fileReferences: FileList,
  loadStyle: LoadStyle = LOAD_STYLE.PLAY,
  atIndex: number | undefined = undefined
): Thunk {
  return (dispatch) => {
    if (fileReferences.length < 1) {
      return;
    } else if (fileReferences.length === 1) {
      const fileReference = fileReferences[0];
      if (SKIN_FILENAME_MATCHER.test(fileReference.name)) {
        dispatch(setSkinFromBlob(fileReference));
        return;
      } else if (EQF_FILENAME_MATCHER.test(fileReference.name)) {
        dispatch(setEqFromFileReference(fileReference));
        return;
      }
    }
    dispatch(addTracksFromReferences(fileReferences, loadStyle, atIndex));
  };
}

export function setSkinFromBlob(blob: Blob | Promise<Blob>): Thunk {
  return async (dispatch, getState, { requireJSZip }) => {
    if (!requireJSZip) {
      alert("Webamp has not been configured to support custom skins.");
      return;
    }
    dispatch({ type: LOADING });
    let JSZip;
    try {
      JSZip = await requireJSZip();
    } catch (e) {
      console.error(e);
      dispatch({ type: LOADED });
      alert("Failed to load the skin parser.");
      return;
    }
    try {
      const skinData = await skinParser(blob, JSZip);
      dispatch({
        type: SET_SKIN_DATA,
        data: {
          skinImages: skinData.images,
          skinColors: skinData.colors,
          skinPlaylistStyle: skinData.playlistStyle,
          skinCursors: skinData.cursors,
          skinRegion: skinData.region,
          skinGenLetterWidths: skinData.genLetterWidths,
          skinGenExColors: skinData.genExColors,
        } as SkinData,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: LOADED });
      alert(`Failed to parse skin`);
    }
  };
}

export function setSkinFromUrl(url: string): Thunk {
  return async (dispatch) => {
    dispatch({ type: LOADING });
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      dispatch(setSkinFromBlob(response.blob()));
    } catch (e) {
      console.error(e);
      dispatch({ type: LOADED });
      alert(`Failed to download skin from ${url}`);
    }
  };
}

// This function is private, since Winamp consumers can provide means for
// opening files via other methods. Only use the file type specific
// versions below, since they can defer to the user-defined behavior.
function _openFileDialog(
  accept: string | null,
  expectedType: "SKIN" | "MEDIA" | "EQ"
): Thunk {
  return async (dispatch) => {
    const fileReferences = await promptForFileReferences({ accept });
    dispatch({
      type: "OPENED_FILES",
      expectedType,
      count: fileReferences.length,
      firstFileName: fileReferences[0]?.name,
    });
    dispatch(loadFilesFromReferences(fileReferences));
  };
}

export function openEqfFileDialog(): Thunk {
  return _openFileDialog(".eqf", "EQ");
}

export function openMediaFileDialog(): Thunk {
  return _openFileDialog(null, "MEDIA");
}

export function openSkinFileDialog() {
  return _openFileDialog(".zip, .wsz", "SKIN");
}

export function fetchMediaDuration(url: string, id: number): Thunk {
  return (dispatch, getState) => {
    loadQueue.push(
      async () => {
        try {
          const duration = await genMediaDuration(url);
          dispatch({ type: SET_MEDIA_DURATION, duration, id });
        } catch (e) {
          // TODO: Should we update the state to indicate that we don't know the length?
        }
      },

      () => {
        const trackIsVisible = getTrackIsVisibleFunction(getState());
        return trackIsVisible(id)
          ? DURATION_VISIBLE_PRIORITY
          : DURATION_PRIORITY;
      }
    );
  };
}

export function loadMedia(
  e: React.DragEvent<HTMLDivElement>,
  loadStyle: LoadStyle = LOAD_STYLE.NONE,
  atIndex = 0
): Thunk {
  const { files } = e.dataTransfer;
  return async (dispatch, getState, { handleTrackDropEvent }) => {
    if (handleTrackDropEvent) {
      const tracks = await handleTrackDropEvent(e);

      if (tracks != null) {
        dispatch(loadMediaFiles(tracks, loadStyle, atIndex));
        return;
      }
    }
    dispatch(loadFilesFromReferences(files, loadStyle, atIndex));
  };
}

export function loadMediaFiles(
  tracks: Track[],
  loadStyle: LoadStyle = LOAD_STYLE.NONE,
  atIndex = 0
): Thunk {
  return (dispatch) => {
    if (loadStyle === LOAD_STYLE.PLAY) {
      // I'm the worst. It just so happens that in every case that we autoPlay,
      // we should also clear all tracks.
      dispatch(removeAllTracks());
    }
    tracks.forEach((track, i) => {
      const priority = i === 0 ? loadStyle : LOAD_STYLE.NONE;
      dispatch(loadMediaFile(track, priority, atIndex + i));
    });
  };
}

export function loadMediaFile(
  track: Track,
  priority: LoadStyle = LOAD_STYLE.NONE,
  atIndex = 0
): Thunk {
  return (dispatch) => {
    const id = Utils.uniqueId();
    const { defaultName, metaData, duration } = track;
    let canonicalUrl: string;
    if ("url" in track) {
      canonicalUrl = track.url.toString();
    } else if ("blob" in track) {
      canonicalUrl = URL.createObjectURL(track.blob);
    } else {
      throw new Error("Expected track to have either a blob or a url");
    }

    dispatch({
      type: ADD_TRACK_FROM_URL,
      url: canonicalUrl,
      duration: track.duration,
      defaultName,
      id,
      atIndex,
    });
    switch (priority) {
      case LOAD_STYLE.BUFFER:
        dispatch({ type: BUFFER_TRACK, id });
        break;
      case LOAD_STYLE.PLAY:
        dispatch({ type: PLAY_TRACK, id });
        break;
      case LOAD_STYLE.NONE:
      default:
        // If we're not going to load this right away,
        // we should set duration on our own
        if (duration != null) {
          dispatch({ type: SET_MEDIA_DURATION, duration, id });
        } else {
          dispatch(fetchMediaDuration(canonicalUrl, id));
        }
    }

    if (metaData != null) {
      const { artist, title, album } = metaData;
      dispatch({
        type: SET_MEDIA_TAGS,
        artist,
        title,
        album,
        // For now, we lie about these next three things.
        // TODO: Ideally we would leave these as null and force a media data
        // fetch when the user starts playing.
        sampleRate: 44000,
        bitrate: 192000,
        numberOfChannels: 2,
        id,
      });
    } else if ("blob" in track) {
      // Blobs can be loaded quickly
      dispatch(fetchMediaTags(track.blob, id));
    } else {
      dispatch(queueFetchingMediaTags(id));
    }
  };
}

function queueFetchingMediaTags(id: number): Thunk {
  return (dispatch, getState) => {
    const track = getTracks(getState())[id];
    loadQueue.push(
      () => dispatch(fetchMediaTags(track.url, id)),
      () => {
        const trackIsVisible = getTrackIsVisibleFunction(getState());
        return trackIsVisible(id)
          ? META_DATA_VISIBLE_PRIORITY
          : META_DATA_PRIORITY;
      }
    );
  };
}

export function fetchMediaTags(file: string | Blob, id: number): Thunk {
  return async (dispatch, getState, { requireMusicMetadata }) => {
    dispatch({ type: MEDIA_TAG_REQUEST_INITIALIZED, id });

    try {
      const metadata = await genMediaTags(file, await requireMusicMetadata());
      // There's more data here, but we don't have a use for it yet:
      const { artist, title, album, picture } = metadata.common;
      const { numberOfChannels, bitrate, sampleRate } = metadata.format;
      let albumArtUrl = null;
      if (picture && picture.length >= 1) {
        const byteArray = new Uint8Array(picture[0].data);
        const blob = new Blob([byteArray], { type: picture[0].format });
        albumArtUrl = URL.createObjectURL(blob);
      }
      dispatch({
        type: SET_MEDIA_TAGS,
        artist: artist ? artist : "",
        title: title ? title : "",
        album,
        albumArtUrl,
        numberOfChannels,
        bitrate,
        sampleRate,
        id,
      });
    } catch (e) {
      dispatch({ type: MEDIA_TAG_REQUEST_FAILED, id });
    }
  };
}

export function setEqFromFileReference(fileReference: File): Thunk {
  return async (dispatch) => {
    const arrayBuffer = await genArrayBufferFromFileReference(fileReference);
    const eqf = parser(arrayBuffer);
    const preset: EqfPreset = eqf.presets[0];
    dispatch(setEqFromObject(preset));
  };
}

export function setEqFromObject(preset: EqfPreset): Thunk {
  return (dispatch) => {
    dispatch(setPreamp(Utils.normalizeEqBand(preset.preamp)));
    BANDS.forEach((band) => {
      // @ts-ignore band and EqfPreset align
      dispatch(setEqBand(band, Utils.normalizeEqBand(preset[`hz${band}`])));
    });
  };
}

export function downloadPreset(): Thunk {
  return (dispatch, getState) => {
    const state = getState();
    const data = getEqfData(state);
    const arrayBuffer = creator(data);
    const base64 = Utils.base64FromArrayBuffer(arrayBuffer);
    const dataURI = `data:application/zip;base64,${base64}`;
    Utils.downloadURI(dataURI, "entry.eqf");
  };
}

export function downloadHtmlPlaylist(): Thunk {
  return (dispatch, getState) => {
    const uri = getPlaylistURL(getState());
    Utils.downloadURI(uri, "Winamp Playlist.html");
  };
}

let el: HTMLInputElement | null = document.createElement("input");
el.type = "file";
// @ts-ingore
const DIR_SUPPORT =
  // @ts-ignore
  typeof el.webkitdirectory !== "undefined" ||
  // @ts-ignore
  typeof el.mozdirectory !== "undefined" ||
  // @ts-ignore
  typeof el.directory !== "undefined";
// Release our reference
el = null;

export function addFilesAtIndex(nextIndex: number): Thunk {
  return async (dispatch) => {
    const fileReferences = await promptForFileReferences();
    dispatch(
      addTracksFromReferences(fileReferences, LOAD_STYLE.NONE, nextIndex)
    );
  };
}

export function addDirAtIndex(nextIndex: number): Thunk {
  return async (dispatch) => {
    if (!DIR_SUPPORT) {
      alert("Not supported in your browser");
      return;
    }
    const fileReferences = await promptForFileReferences({ directory: true });
    dispatch(
      addTracksFromReferences(fileReferences, LOAD_STYLE.NONE, nextIndex)
    );
  };
}

export function addFilesFromUrl(atIndex = 0): Thunk {
  return async (dispatch, getState, { handleAddUrlEvent }) => {
    if (handleAddUrlEvent) {
      const tracks = await handleAddUrlEvent();

      if (tracks != null) {
        dispatch(loadMediaFiles(tracks, LOAD_STYLE.NONE, atIndex));
        return;
      }
    } else {
      alert("Not supported in Webamp");
    }
  };
}

export function addFilesFromList(): Thunk {
  return async (dispatch, getState, { handleLoadListEvent }) => {
    if (handleLoadListEvent) {
      const tracks = await handleLoadListEvent();

      if (tracks != null) {
        dispatch(removeAllTracks());

        dispatch(loadMediaFiles(tracks, LOAD_STYLE.NONE, 0));
        return;
      }
    } else {
      alert("Not supported in Webamp");
    }
  };
}

export function saveFilesToList(): Thunk {
  return (dispatch, getState, { handleSaveListEvent }) => {
    if (handleSaveListEvent) {
      handleSaveListEvent(getUserTracks(getState()));
    } else {
      alert("Not supported in Webamp");
    }
  };
}

export function droppedFiles(e: React.DragEvent, windowId: WindowId): Thunk {
  return (dispatch) =>
    dispatch({
      type: "DROPPED_FILES",
      count: e.dataTransfer.files.length,
      firstFileName: e.dataTransfer.files[0]?.name,
      windowId,
    });
}
