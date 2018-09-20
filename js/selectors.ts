import {
  AppState,
  PlaylistTrack,
  WebampWindow,
  WindowId,
  WindowInfo,
  LoadedURLTrack,
  SerializedStateV1
} from "./types";
import { createSelector } from "reselect";
import {
  denormalize,
  getTimeStr,
  clamp,
  percentToIndex,
  objectMap
} from "./utils";
import {
  BANDS,
  TRACK_HEIGHT,
  WINDOW_RESIZE_SEGMENT_WIDTH,
  WINDOW_RESIZE_SEGMENT_HEIGHT,
  WINDOW_WIDTH,
  MEDIA_STATUS,
  MEDIA_TAG_REQUEST_STATUS
} from "./constants";
import { createPlaylistURL } from "./playlistHtml";
import * as fromPlaylist from "./reducers/playlist";
import * as fromDisplay from "./reducers/display";
import * as fromEqualizer from "./reducers/equalizer";
import { generateGraph } from "./resizeUtils";

export const getSliders = (state: AppState) => state.equalizer.sliders;

export const getEqfData = createSelector(getSliders, sliders => {
  const preset: { [key: string]: number | string } = {
    name: "Entry1",
    preamp: denormalize(sliders.preamp)
  };
  BANDS.forEach(band => {
    preset[`hz${band}`] = denormalize(sliders[band]);
  });
  const eqfData = {
    presets: [preset],
    type: "Winamp EQ library file v1.1"
  };
  return eqfData;
});

export const getTracks = (state: AppState) => state.playlist.tracks;
const getTrackOrder = (state: AppState) => state.playlist.trackOrder;

export const getTrackCount = createSelector(
  getTrackOrder,
  trackOrder => trackOrder.length
);

export const getOrderedTracks = createSelector(
  getTracks,
  getTrackOrder,
  (tracks, trackOrder) => trackOrder.filter(id => tracks[id])
);

const getOrderedTrackObjects = createSelector(
  getTracks,
  getOrderedTracks,
  (tracks, trackOrder): PlaylistTrack[] => trackOrder.map(id => tracks[id])
);

export const getSelectedTrackObjects = createSelector(
  getOrderedTrackObjects,
  tracks => tracks.filter(track => track.selected)
);

// If a duration is `null`, it counts as zero, which seems fine enough.
const runningTimeFromTracks = (tracks: PlaylistTrack[]) =>
  tracks.reduce((time, track) => time + Number(track.duration), 0);

const getTotalRunningTime = createSelector(
  getOrderedTrackObjects,
  runningTimeFromTracks
);

const getSelectedRunningTime = createSelector(
  getSelectedTrackObjects,
  runningTimeFromTracks
);

// Note: We should append "+" to these values if some of the tracks are of unknown time.
export const getRunningTimeMessage = createSelector(
  getTotalRunningTime,
  getSelectedRunningTime,
  (totalRunningTime, selectedRunningTime) =>
    `${getTimeStr(selectedRunningTime)}/${getTimeStr(totalRunningTime)}`
);

// TODO: use slectors to get memoization
export const getCurrentTrackIndex = (state: AppState): number => {
  const { playlist } = state;
  if (playlist.currentTrack == null) {
    return -1;
  }
  return playlist.trackOrder.indexOf(playlist.currentTrack);
};

export const getCurrentTrackNumber = createSelector(
  getCurrentTrackIndex,
  currentTrackIndex => currentTrackIndex + 1
);

export const getCurrentTrackId = (state: AppState) =>
  state.playlist.currentTrack;

export const nextTrack = (state: AppState, n = 1) => {
  const {
    playlist: { trackOrder },
    media: { repeat }
  } = state;
  const trackCount = getTrackCount(state);
  if (trackCount === 0) {
    return null;
  }

  const currentIndex = getCurrentTrackIndex(state);

  let nextIndex = currentIndex + n;
  if (repeat) {
    nextIndex = nextIndex % trackCount;
    if (nextIndex < 0) {
      // Handle wrapping around backwards
      nextIndex += trackCount;
    }
    return trackOrder[nextIndex];
  }

  if (currentIndex === trackCount - 1 && n > 0) {
    return null;
  } else if (currentIndex === 0 && n < 0) {
    return null;
  }

  nextIndex = clamp(nextIndex, 0, trackCount - 1);
  return trackOrder[nextIndex];
};

const BASE_WINDOW_HEIGHT = 58;
export const getNumberOfVisibleTracks = (state: AppState) => {
  const playlistSize = getWindowSize(state)("playlist");
  return Math.floor(
    (BASE_WINDOW_HEIGHT + WINDOW_RESIZE_SEGMENT_HEIGHT * playlistSize[1]) /
      TRACK_HEIGHT
  );
};

export const getOverflowTrackCount = createSelector(
  getTrackCount,
  getNumberOfVisibleTracks,
  (trackCount, numberOfVisibleTracks) =>
    Math.max(0, trackCount - numberOfVisibleTracks)
);

const _getPlaylistScrollPosition = (state: AppState) =>
  state.display.playlistScrollPosition;

export const getPlaylistScrollPosition = createSelector(
  getOverflowTrackCount,
  _getPlaylistScrollPosition,
  (overflowTrackCount, playlistScrollPosition) => {
    if (overflowTrackCount === 0) {
      return 0;
    }
    return Math.round(
      (Math.round((overflowTrackCount * playlistScrollPosition) / 100) /
        overflowTrackCount) *
        100
    );
  }
);

export const getScrollOffset = createSelector(
  _getPlaylistScrollPosition,
  getTrackCount,
  getNumberOfVisibleTracks,
  (playlistScrollPosition, trackCount, numberOfVisibleTracks) => {
    const overflow = Math.max(0, trackCount - numberOfVisibleTracks);
    return percentToIndex(playlistScrollPosition / 100, overflow + 1);
  }
);

export const getVisibleTrackIds = createSelector(
  getScrollOffset,
  getTrackOrder,
  getNumberOfVisibleTracks,
  (offset, trackOrder, numberOfVisibleTracks) =>
    trackOrder.slice(offset, offset + numberOfVisibleTracks)
);

export const getTrackIsVisibleFunction = createSelector(
  getVisibleTrackIds,
  visibleTrackIds => {
    return (id: number) => visibleTrackIds.includes(id);
  }
);

export const getVisibleTracks = createSelector(
  getVisibleTrackIds,
  getTracks,
  (visibleTrackIds, tracks) => visibleTrackIds.map(id => tracks[id])
);

export const getPlaylist = (state: AppState) => state.playlist;

export const getDuration = (state: AppState): number | null => {
  const { playlist } = state;
  if (playlist.currentTrack == null) {
    return null;
  }
  const currentTrack = playlist.tracks[playlist.currentTrack];
  return currentTrack && currentTrack.duration;
};

export const getTrackDisplayName = createSelector(getPlaylist, playlist => {
  return (trackId: number | null) =>
    fromPlaylist.getTrackDisplayName(playlist, trackId);
});

export const getCurrentTrackDisplayName = createSelector(
  getCurrentTrackId,
  getTrackDisplayName,
  (id, getName) => {
    return getName(id);
  }
);

export const getMediaIsPlaying = (state: AppState) =>
  state.media.status === MEDIA_STATUS.PLAYING;

export const getCurrentTrack = createSelector(
  getCurrentTrackId,
  getPlaylist,
  (trackId, playlist): PlaylistTrack | null => {
    return trackId == null ? null : playlist.tracks[trackId];
  }
);
export const getCurrentlyPlayingTrackIdIfLoaded = createSelector(
  getMediaIsPlaying,
  getCurrentTrack,
  (mediaIsPlaying, currentTrack) => {
    if (
      !mediaIsPlaying ||
      !currentTrack ||
      currentTrack.mediaTagsRequestStatus ===
        MEDIA_TAG_REQUEST_STATUS.INITIALIZED
    ) {
      return null;
    }
    return currentTrack.id;
  }
);

export const getCurrentTrackInfo = createSelector(
  getCurrentTrack,
  (track: PlaylistTrack | null): LoadedURLTrack | null => {
    if (track == null) {
      return null;
    }
    return {
      url: track.url,
      metaData: {
        title: track.title || null,
        artist: track.artist || null,
        album: track.album || null,
        albumArtUrl: track.albumArtUrl || null
      }
    };
  }
);

export const getMinimalMediaText = createSelector(
  getCurrentTrackNumber,
  getCurrentTrackDisplayName,
  (trackNumber, name) => (name == null ? null : `${trackNumber}. ${name}`)
);

export const getMediaText = createSelector(
  getMinimalMediaText,
  getDuration,
  (minimalMediaText, duration) =>
    minimalMediaText == null
      ? null
      : // TODO: Maybe the `  ***  ` should actually be added by the marquee
        `${minimalMediaText} (${getTimeStr(duration)})  ***  `
);

export const getNumberOfTracks = (state: AppState) =>
  getTrackOrder(state).length;
const getPlaylistDuration = createSelector(getTracks, tracks =>
  Object.values(tracks).reduce(
    (total, track) => total + (track.duration || 0),
    0
  )
);

export const getPlaylistURL = createSelector(
  getNumberOfTracks,
  getPlaylistDuration,
  getTrackOrder,
  getTracks,
  getTrackDisplayName,
  (numberOfTracks, playlistDuration, trackOrder, tracks, getDisplayName) =>
    createPlaylistURL({
      numberOfTracks,
      averageTrackLength: getTimeStr(playlistDuration / numberOfTracks),
      // TODO: Handle hours
      playlistLengthMinutes: Math.floor(playlistDuration / 60),
      playlistLengthSeconds: Math.floor(playlistDuration % 60),
      tracks: trackOrder.map(
        (id, i) =>
          `${i + 1}. ${getDisplayName(id)} (${getTimeStr(tracks[id].duration)})`
      )
    })
);

export function getWindowPositions(state: AppState) {
  return state.windows.positions;
}

const WINDOW_HEIGHT = 116;
const SHADE_WINDOW_HEIGHT = 14;

function getWPixelSize(w: WebampWindow, doubled: boolean) {
  const [width, height] = w.size;
  const doubledMultiplier = doubled && w.canDouble ? 2 : 1;
  const pix = {
    height: WINDOW_HEIGHT + height * WINDOW_RESIZE_SEGMENT_HEIGHT,
    width: WINDOW_WIDTH + width * WINDOW_RESIZE_SEGMENT_WIDTH
  };
  return {
    height: (w.shade ? SHADE_WINDOW_HEIGHT : pix.height) * doubledMultiplier,
    width: pix.width * doubledMultiplier
  };
}

export function getWindowSize(state: AppState) {
  return (windowId: WindowId) => state.windows.genWindows[windowId].size;
}

export function getWindowOpen(state: AppState) {
  return (windowId: WindowId) => state.windows.genWindows[windowId].open;
}

export function getWindowShade(state: AppState) {
  return (windowId: WindowId) => state.windows.genWindows[windowId].shade;
}

export function getWindowHidden(state: AppState) {
  return (windowId: WindowId) => state.windows.genWindows[windowId].hidden;
}

export const getGenWindows = (state: AppState) => {
  return state.windows.genWindows;
};

export function getDoubled(state: AppState) {
  return state.display.doubled;
}

export const getWindowSizes = createSelector(
  getGenWindows,
  getDoubled,
  (windows, doubled) => {
    return objectMap(windows, w => getWPixelSize(w, doubled));
  }
);

export const getWindowPixelSize = createSelector(getWindowSizes, sizes => {
  return (windowId: WindowId) => sizes[windowId];
});

export const getWindowsInfo = createSelector(
  getWindowSizes,
  getWindowPositions,
  (sizes, positions): WindowInfo[] =>
    Object.keys(sizes).map(key => ({ key, ...sizes[key], ...positions[key] }))
);

export const getWindowGraph = createSelector(getWindowsInfo, generateGraph);

export const getSkinPlaylistStyle = (state: AppState) => {
  return (
    state.display.skinPlaylistStyle || {
      normal: "#00FF00",
      current: "#FFFFFF",
      normalbg: "#000000",
      selectedbg: "#0000C6",
      font: "Arial"
    }
  );
};

export const getVisualizerStyle = (state: AppState) =>
  fromDisplay.getVisualizerStyle(state.display);

export const getVolume = (state: AppState) => state.media.volume;
export const getBalance = (state: AppState) => state.media.balance;

export const getChannels = (state: AppState) => state.media.channels;
export function getSerlializedState(state: AppState): SerializedStateV1 {
  return {
    version: 1,
    equalizer: fromEqualizer.getSerializedState(state.equalizer),
    display: fromDisplay.getSerializedState(state.display)
  };
}
