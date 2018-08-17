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
  LOADING,
  SET_MEDIA
} from "../actionTypes";
import LoadQueue from "../loadQueue";

import { removeAllTracks } from "./playlist";
import { setPreamp, setEqBand } from "./equalizer";

// Lower is better
const DURATION_VISIBLE_PRIORITY = 5;
const META_DATA_VISIBLE_PRIORITY = 10;
const DURATION_PRIORITY = 15;
const META_DATA_PRIORITY = 20;

const loadQueue = new LoadQueue({ threads: 4 });

export function addTracksFromReferences(fileReferences, loadStyle, atIndex) {
  const tracks = Array.from(fileReferences).map(file => ({
    blob: file,
    defaultName: file.name
  }));
  return loadMediaFiles(tracks, loadStyle, atIndex);
}

const SKIN_FILENAME_MATCHER = new RegExp("(wsz|zip)$", "i");
const EQF_FILENAME_MATCHER = new RegExp("eqf$", "i");
export function loadFilesFromReferences(
  fileReferences,
  loadStyle = LOAD_STYLE.PLAY,
  atIndex = null
) {
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

export function setSkinFromArrayBuffer(arrayBuffer) {
  return async dispatch => {
    dispatch({ type: LOADING });
    try {
      const skinData = await skinParser(arrayBuffer);
      dispatch({
        type: SET_SKIN_DATA,
        skinImages: skinData.images,
        skinColors: skinData.colors,
        skinPlaylistStyle: skinData.playlistStyle,
        skinCursors: skinData.cursors,
        skinRegion: skinData.region,
        skinGenLetterWidths: skinData.genLetterWidths
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: LOADED });
      alert(`Failed to parse skin`);
    }
  };
}

export function setSkinFromFileReference(skinFileReference) {
  return async dispatch => {
    dispatch({ type: LOADING });
    const arrayBuffer = await genArrayBufferFromFileReference(
      skinFileReference
    );
    dispatch(setSkinFromArrayBuffer(arrayBuffer));
  };
}

export function setSkinFromUrl(url) {
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
function _openFileDialog(accept) {
  return async dispatch => {
    const fileReferences = await promptForFileReferences({ accept });
    dispatch(loadFilesFromReferences(fileReferences));
  };
}

export function openEqfFileDialog() {
  return _openFileDialog(".eqf");
}

export function openMediaFileDialog() {
  return _openFileDialog();
}

export function openSkinFileDialog() {
  return _openFileDialog(".zip, .wsz");
}

export function fetchMediaDuration(url, id) {
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

export function loadMediaFiles(tracks, loadStyle = null, atIndex = 0) {
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

export function loadMediaFile(track, priority = null, atIndex = 0) {
  return dispatch => {
    const id = uniqueId();
    const { url, blob, defaultName, metaData } = track;
    let canonicalUrl = url;
    if (canonicalUrl == null) {
      if (blob == null) {
        throw new Error("Expected track to have either a blob or a url");
      }
      canonicalUrl = URL.createObjectURL(track.blob);
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
    }

    if (metaData != null) {
      const { artist, title } = metaData;
      dispatch({ type: SET_MEDIA_TAGS, artist, title, id });
    } else if (blob != null) {
      // Blobs can be loaded quickly
      dispatch(fetchMediaTags(blob, id));
    } else {
      dispatch(queueFetchingMediaTags(id));
    }
  };
}

function queueFetchingMediaTags(id) {
  return (dispatch, getState) => {
    const track = getTracks(getState())[id];
    return loadQueue.push(
      () => dispatch(fetchMediaTags(track.url, id)),
      () => {
        const trackIsVisible = getTrackIsVisibleFunction(getState());
        return trackIsVisible(track.id)
          ? META_DATA_VISIBLE_PRIORITY
          : META_DATA_PRIORITY;
      }
    );
  };
}

let ts0;

export function fetchMediaTags(file, id) {

  if (!ts0) {
    ts0 = Date.now();
    console.log(ts0 + ' loading music-metadata');
  }

  return async dispatch => {
    dispatch({ type: MEDIA_TAG_REQUEST_INITIALIZED, id });

    let metadata;
    try {
      metadata = await genMediaTags(file, event => {
        console.log(Date.now()- ts0 + ` ${event.tag.type}.${event.tag.id}`);

        switch(event.tag.type) {
          case 'common':
            switch(event.tag.id) {
              case 'artist':
              case 'title':
                dispatch({
                  type: SET_MEDIA_TAGS,
                  artist: event.metadata.common.artist,
                  title: event.metadata.common.title,
                  albumArtUrl: null, id }); // ToDo albumArtUrl
                break;
            }
            break;

          case 'format':
            switch(event.tag.id) {
              case 'duration':
                dispatch({type: SET_MEDIA_DURATION, duration: event.metadata.format.duration, id });

              case 'bitrate':
              case 'sampleRate':
              case 'numberOfChannels':
                /*
                dispatch({
                  type: SET_MEDIA,
                  kbps: event.metadata.format.bitrate ? Math.round(event.metadata.format.bitrate / 1000).toString() : '',
                  khz: event.metadata.format.sampleRate ? Math.round(event.metadata.format.sampleRate / 1000).toString() : '',
                  channels: event.metadata.format.numberOfChannels,
                  length: event.metadata.format.duration,
                  id
                });*/
                break;
            }
            break;
        }
      });
      // There's more data here, but we don't have a use for it yet:
      const { artist, title, picture } = metadata.common;
      let albumArtUrl = null;
      if (picture && picture.length >= 1) {
        const byteArray = new Uint8Array(picture[0].data);
        const blob = new Blob([byteArray], { type: picture[0].format });
        albumArtUrl = URL.createObjectURL(blob);
      }
      // dispatch({ type: SET_MEDIA_TAGS, artist, title, albumArtUrl, id });
    } catch (e) {
      // dispatch({ type: MEDIA_TAG_REQUEST_FAILED, id });
      return;
    }

    // If we're not going to load this right away,
    // we should set duration on our own
    if (metadata.format.duration) {
      dispatch({
        type: SET_MEDIA_DURATION,
        duration: metadata.format.duration,
        id
      });
    } else {
      //  ToDo? dispatch(fetchMediaDuration(canonicalUrl, id));
    }

    dispatch({
      type: SET_MEDIA,
      kbps: Math.round(metadata.format.bitrate / 1000).toString(),
      khz: Math.round(metadata.format.sampleRate / 1000).toString(),
      channels: metadata.format.channels,
      length: metadata.format.duration,
      id
    });
  };
}

export function setEqFromFileReference(fileReference) {
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

export function downloadPreset() {
  return (dispatch, getState) => {
    const state = getState();
    const data = getEqfData(state);
    const arrayBuffer = creator(data);
    const base64 = base64FromArrayBuffer(arrayBuffer);
    const dataURI = `data:application/zip;base64,${base64}`;
    downloadURI(dataURI, "entry.eqf");
  };
}

export function downloadHtmlPlaylist() {
  return (dispatch, getState) => {
    const uri = getPlaylistURL(getState());
    downloadURI(uri, "Winamp Playlist.html");
  };
}
