import { PlaylistTrack, Action } from "../types";
import {
  SET_MEDIA,
  SET_MEDIA_TAGS,
  SET_MEDIA_DURATION,
  MEDIA_TAG_REQUEST_INITIALIZED,
  MEDIA_TAG_REQUEST_FAILED,
  ADD_TRACK_FROM_URL,
} from "../actionTypes";
import { MEDIA_TAG_REQUEST_STATUS } from "../constants";
import * as TrackUtils from "../trackUtils";

export interface TracksState {
  [id: string]: PlaylistTrack;
}

const defaultPlaylistState: TracksState = {};

const tracks = (
  state: TracksState = defaultPlaylistState,
  action: Action
): TracksState => {
  switch (action.type) {
    case ADD_TRACK_FROM_URL:
      return {
        ...state,
        [action.id]: {
          id: action.id,
          defaultName: action.defaultName || null,
          duration: action.duration ?? null,
          url: action.url,
          mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.INITIALIZED,
        },
      };
    case SET_MEDIA: {
      const newTrack = {
        ...state[action.id],
        duration: action.length,
      };
      return {
        ...state,
        [action.id]: newTrack,
      };
    }
    case MEDIA_TAG_REQUEST_INITIALIZED:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.INITIALIZED,
        },
      };
    case MEDIA_TAG_REQUEST_FAILED:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.FAILED,
        },
      };
    case SET_MEDIA_DURATION: {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          duration: action.duration,
        },
      };
    }
    case SET_MEDIA_TAGS:
      const track = state[action.id];
      const {
        sampleRate,
        bitrate,
        numberOfChannels,
        title,
        artist,
        album,
        albumArtUrl,
      } = action;
      const { kbps, khz, channels } = track;
      return {
        ...state,
        [action.id]: {
          ...track,
          mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.COMPLETE,
          title,
          artist,
          album,
          albumArtUrl,
          kbps: bitrate != null ? String(Math.round(bitrate / 1000)) : kbps,
          khz: sampleRate != null ? String(Math.round(sampleRate / 1000)) : khz,
          channels: numberOfChannels != null ? numberOfChannels : channels,
        },
      };
    default:
      return state;
  }
};

export default tracks;

export const getTrackDisplayName = (
  state: TracksState,
  id: number | null = null
): string | null => {
  if (id == null) {
    return null;
  }
  const track = state[id];
  if (track == null) {
    return null;
  }

  return TrackUtils.trackName(track);
};
