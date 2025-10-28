import { PlaylistTrack, Action } from "../types";
import { MEDIA_TAG_REQUEST_STATUS } from "../constants";
import * as TrackUtils from "../trackUtils";

export interface TracksState {
  [id: string]: PlaylistTrack;
}

let finalKhz: String = 'NaN';
let finalKbps: String = 'NaN';
function massageKhz(khz: number) {
  let stringKhz = String(Math.round(khz / 1000));
  if (khz/1000 != null) finalKhz = stringKhz;
  if (khz/1000 <= 100) finalKhz = stringKhz;
  if (khz/1000 <= 10) finalKhz = ' '+stringKhz.substring(0,1);
  if (khz/1000 >= 100) finalKhz = stringKhz.substring(1,3);
  return finalKhz;
}

function massageKbps(kbps: number) {
  let stringBitrate = String(Math.round(kbps / 1000));
  if (kbps/1000 != null) finalKbps = stringBitrate;
  if (kbps/1000 <= 100) finalKbps = ' '+stringBitrate;
  if (kbps/1000 <= 10) finalKbps = '  '+stringBitrate;
  if (kbps/1000 >= 1000) finalKbps = stringBitrate.substring(0,2)+'H'; // if you asked me what this meant
  if (kbps/1000 >= 10000) finalKbps = ' '+stringBitrate.substring(0,1)+'C'; // i wouldnt know what to tell you
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
          kbps: bitrate != null ? massageKbps(bitrate) : kbps,
          khz: sampleRate != null ? massageKhz(sampleRate) : khz,
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
