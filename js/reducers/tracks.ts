import { PlaylistTrack, Action } from "../types";
import {
  SET_MEDIA,
  SET_MEDIA_TAGS,
  SET_MEDIA_DURATION,
  MEDIA_TAG_REQUEST_INITIALIZED,
  MEDIA_TAG_REQUEST_FAILED,
  ADD_TRACK_FROM_URL
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
          duration: action.duration == null ? null : action.duration,
          url: action.url,
          mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.INITIALIZED
        }
      };
    case SET_MEDIA: {
      const newTrack = {
        ...state[action.id],
        duration: action.length
      };
      return {
        ...state,
        [action.id]: newTrack
      };
    }
    case SET_MEDIA_TAGS: {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.COMPLETE,
          title: action.title,
          artist: action.artist,
          album: action.album,
          albumArtUrl: action.albumArtUrl
        }
      };
    }
    case MEDIA_TAG_REQUEST_INITIALIZED:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.INITIALIZED
        }
      };
    case MEDIA_TAG_REQUEST_FAILED:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.FAILED
        }
      };
    case SET_MEDIA_DURATION: {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          duration: action.duration
        }
      };
    }
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
