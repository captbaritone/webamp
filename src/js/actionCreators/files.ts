import { parser, creator } from "winamp-eqf";
import { BANDS, LOAD_STYLE } from "../constants";

import {
  base64FromArrayBuffer,
  uniqueId,
  normalize,
  downloadURI
} from "../utils";

import {
  promptForFileReferences,
  genArrayBufferFromFileReference,
  genMediaDuration,
  genMediaTags
} from "../fileUtils";
import skinParser from "../skinParser";
import {
  getTracks,
  getTrackIsVisibleFunction,
  getEqfData,
  getPlaylistURL
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
  LOADING
} from "../actionTypes";
import LoadQueue from "../loadQueue";

import { removeAllTracks } from "./playlist";
import { setPreamp, setEqBand } from "./equalizer";
import {
  LoadStyle,
  Dispatchable,
  PlaylistTrack,
  Track,
  URLTrack
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
): Dispatchable {
  const tracks: Track[] = Array.from(fileReferences).map(file => ({
    blob: file,
    defaultName: file.name
  }));
  return loadMediaFiles(tracks, loadStyle, atIndex);
}

const SKIN_FILENAME_MATCHER = new RegExp("(wsz|zip)$", "i");
const EQF_FILENAME_MATCHER = new RegExp("eqf$", "i");
export function loadFilesFromReferences(
  fileReferences: FileList,
  loadStyle = LOAD_STYLE.PLAY,
  atIndex: number | undefined = undefined
): Dispatchable {
  return dispatch => {
    if (fileReferences.length < 1) {
      return;
    } else if (fileReferences.length === 1) {
      const fileReference = fileReferences[0];
      if (SKIN_FILENAME_MATCHER.test(fileReference.name)) {
        dispatch(setSkinFromFileReference(fileReference));
        return;
      } else if (EQF_FILENAME_MATCHER.test(fileReference.name)) {
        dispatch(setEqFromFileReference(fileReference));
        return;
      }
    }
    dispatch(addTracksFromReferences(fileReferences, loadStyle, atIndex));
  };
}

export function setSkinFromArrayBuffer(
  arrayBuffer: ArrayBuffer | Promise<ArrayBuffer>
): Dispatchable {
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
      const skinData = await skinParser(arrayBuffer, JSZip);
      dispatch({
        type: SET_SKIN_DATA,
        data: {
          skinImages: skinData.images,
          skinColors: skinData.colors,
          skinPlaylistStyle: skinData.playlistStyle,
          skinCursors: skinData.cursors,
          skinRegion: skinData.region,
          skinGenLetterWidths: skinData.genLetterWidths
        }
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: LOADED });
      alert(`Failed to parse skin`);
    }
  };
}

export function setSkinFromFileReference(
  skinFileReference: File
): Dispatchable {
  return async dispatch => {
    dispatch({ type: LOADING });
    const arrayBuffer = await genArrayBufferFromFileReference(
      skinFileReference
    );
    dispatch(setSkinFromArrayBuffer(arrayBuffer));
  };
}

export function setSkinFromUrl(url: string): Dispatchable {
  return async dispatch => {
    dispatch({ type: LOADING });
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      dispatch(setSkinFromArrayBuffer(response.arrayBuffer()));
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
function _openFileDialog(accept: string | null): Dispatchable {
  return async dispatch => {
    const fileReferences = await promptForFileReferences({ accept });
    dispatch(loadFilesFromReferences(fileReferences));
  };
}

export function openEqfFileDialog(): Dispatchable {
  return _openFileDialog(".eqf");
}

export function openMediaFileDialog(): Dispatchable {
  return _openFileDialog(null);
}

export function openSkinFileDialog() {
  return _openFileDialog(".zip, .wsz");
}

export function fetchMediaDuration(url: string, id: number): Dispatchable {
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

export function loadMediaFiles(
  tracks: Track[],
  loadStyle: LoadStyle | null = null,
  atIndex = 0
): Dispatchable {
  return dispatch => {
    if (loadStyle === LOAD_STYLE.PLAY) {
      // I'm the worst. It just so happens that in every case that we autoPlay,
      // we should also clear all tracks.
      dispatch(removeAllTracks());
    }
    tracks.forEach((track, i) => {
      const priority = i === 0 && loadStyle != null ? loadStyle : null;
      dispatch(loadMediaFile(track, priority, atIndex + i));
    });
  };
}

export function loadMediaFile(
  track: Track,
  priority: LoadStyle | null = null,
  atIndex = 0
): Dispatchable {
  return dispatch => {
    const id = uniqueId();
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
      atIndex
    });
    switch (priority) {
      case LOAD_STYLE.BUFFER:
        dispatch({ type: BUFFER_TRACK, id });
        break;
      case LOAD_STYLE.PLAY:
        dispatch({ type: PLAY_TRACK, id });
        break;
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
      dispatch({ type: SET_MEDIA_TAGS, artist, title, album, id });
    } else if ("blob" in track) {
      // Blobs can be loaded quickly
      dispatch(fetchMediaTags(track.blob, id));
    } else {
      dispatch(queueFetchingMediaTags(id));
    }
  };
}

function queueFetchingMediaTags(id: number): Dispatchable {
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

export function fetchMediaTags(file: string | Blob, id: number): Dispatchable {
  return async (dispatch, getState, { requireJSMediaTags }) => {
    dispatch({ type: MEDIA_TAG_REQUEST_INITIALIZED, id });
    try {
      const data = await genMediaTags(file, await requireJSMediaTags());
      // There's more data here, but we don't have a use for it yet:
      // https://github.com/aadsm/jsmediatags#shortcuts
      const { artist, title, album, picture } = data.tags;
      let albumArtUrl = null;
      if (picture) {
        const byteArray = new Uint8Array(picture.data);
        const blob = new Blob([byteArray], { type: picture.type });
        albumArtUrl = URL.createObjectURL(blob);
      }
      dispatch({ type: SET_MEDIA_TAGS, artist, title, album, albumArtUrl, id });
    } catch (e) {
      dispatch({ type: MEDIA_TAG_REQUEST_FAILED, id });
    }
  };
}

export function setEqFromFileReference(fileReference: File): Dispatchable {
  return async dispatch => {
    const arrayBuffer = await genArrayBufferFromFileReference(fileReference);
    const eqf = parser(arrayBuffer);
    const preset = eqf.presets[0];

    dispatch(setPreamp(normalize(preset.preamp)));
    BANDS.forEach(band => {
      dispatch(setEqBand(band, normalize(preset[`hz${band}`])));
    });
  };
}

export function downloadPreset(): Dispatchable {
  return (dispatch, getState) => {
    const state = getState();
    const data = getEqfData(state);
    const arrayBuffer = creator(data);
    const base64 = base64FromArrayBuffer(arrayBuffer);
    const dataURI = `data:application/zip;base64,${base64}`;
    downloadURI(dataURI, "entry.eqf");
  };
}

export function downloadHtmlPlaylist(): Dispatchable {
  return (dispatch, getState) => {
    const uri = getPlaylistURL(getState());
    downloadURI(uri, "Winamp Playlist.html");
  };
}
