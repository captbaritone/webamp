import { PlaylistTrack, Action } from "../types";
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
    case "ADD_TRACK_FROM_URL":
      return {
        ...state,
        [(action as any).id]: {
          id: (action as any).id,
          defaultName: (action as any).defaultName || null,
          duration: (action as any).duration ?? null,
          url: (action as any).url,
          mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.INITIALIZED,
        },
      };
    case "SET_MEDIA": {
      const newTrack = {
        ...state[(action as any).id],
        duration: (action as any).length,
      };
      return {
        ...state,
        [(action as any).id]: newTrack,
      };
    }
    case "MEDIA_TAG_REQUEST_INITIALIZED":
      return {
        ...state,
        [(action as any).id]: {
          ...state[(action as any).id],
          mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.INITIALIZED,
        },
      };
    case "MEDIA_TAG_REQUEST_FAILED":
      return {
        ...state,
        [(action as any).id]: {
          ...state[(action as any).id],
          mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.FAILED,
        },
      };
    case "SET_MEDIA_DURATION": {
      return {
        ...state,
        [(action as any).id]: {
          ...state[(action as any).id],
          duration: (action as any).duration,
        },
      };
    }
    case "SET_MEDIA_TAGS":
      const track = state[(action as any).id];
      const {
        sampleRate,
        bitrate,
        numberOfChannels,
        title,
        artist,
        album,
        albumArtUrl,
      } = action as any;
      const { kbps, khz, channels } = track;
      return {
        ...state,
        [(action as any).id]: {
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
