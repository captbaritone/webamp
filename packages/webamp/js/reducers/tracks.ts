import { PlaylistTrack, Action } from "../types";
import { MEDIA_TAG_REQUEST_STATUS } from "../constants";
import * as TrackUtils from "../trackUtils";

export interface TracksState {
  [id: string]: PlaylistTrack;
}

function massageKhz(khz: number) {
  let finalKhz: String;
  const khzNum: number = Math.round(khz / 1000);

  // there is no real need to run a condition for below 100khz
  // when the other conditions (hopefully) take over
  // ...also to make CI happy
  finalKhz = String(khzNum);
  if (khzNum <= 10) finalKhz = String(khzNum).slice(0, 1).padStart(2, " ");
  if (khzNum >= 100) finalKhz = String(khzNum).slice(1, 3);
  return finalKhz;
}

function massageKbps(kbps: number) {
  let finalKbps: String;
  const bitrateNum: number = Math.round(kbps / 1000);

  finalKbps = String(bitrateNum); // present as is
  if (bitrateNum <= 100) finalKbps = String(bitrateNum).padStart(3, " ");
  if (bitrateNum <= 10) finalKbps = String(bitrateNum).padStart(3, " ");
  // from Justin Frankel directly:
  // IIRC H was for "hundred" and "C" was thousand,
  // though why it was for thousand I have no idea lol, maybe it was a mistake...
  if (bitrateNum >= 1000) finalKbps = `${String(bitrateNum).slice(0, 2)}H`;
  if (bitrateNum >= 10000)
    finalKbps = `${String(bitrateNum).slice(0, 1).padStart(2, " ")}C`;
  return finalKbps;
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
    case "SET_MEDIA_TAGS": {
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

      // Clean up old album art URL if it's being replaced
      if (
        track.albumArtUrl &&
        track.albumArtUrl.startsWith("blob:") &&
        track.albumArtUrl !== albumArtUrl
      ) {
        URL.revokeObjectURL(track.albumArtUrl);
      }

      return {
        ...state,
        [(action as any).id]: {
          ...track,
          mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.COMPLETE,
          title,
          artist,
          album,
          albumArtUrl,
          kbps: bitrate != null ? massageKbps(bitrate) : kbps,
          khz: sampleRate != null ? massageKhz(sampleRate) : khz,
          channels: numberOfChannels != null ? numberOfChannels : channels,
        },
      };
    }
    case "REMOVE_TRACKS": {
      const actionIds = (action as any).ids;
      const newState = { ...state };

      // Clean up object URLs for removed tracks
      actionIds.forEach((id: number) => {
        const track = state[id];
        if (track) {
          // Revoke track URL if it's an object URL
          if (track.url && track.url.startsWith("blob:")) {
            URL.revokeObjectURL(track.url);
          }
          // Revoke album art URL if it's an object URL
          if (track.albumArtUrl && track.albumArtUrl.startsWith("blob:")) {
            URL.revokeObjectURL(track.albumArtUrl);
          }
          delete newState[id];
        }
      });

      return newState;
    }
    case "REMOVE_ALL_TRACKS": {
      // Clean up all object URLs
      Object.values(state).forEach((track) => {
        if (track.url && track.url.startsWith("blob:")) {
          URL.revokeObjectURL(track.url);
        }
        if (track.albumArtUrl && track.albumArtUrl.startsWith("blob:")) {
          URL.revokeObjectURL(track.albumArtUrl);
        }
      });

      return {};
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
