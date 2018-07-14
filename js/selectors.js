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
  WINDOW_WIDTH
} from "./constants";
import { createPlaylistURL } from "./playlistHtml";
import * as fromPlaylist from "./reducers/playlist";
import * as fromDisplay from "./reducers/display";
import { generateGraph } from "./resizeUtils";

export const getEqfData = state => {
  const { sliders } = state.equalizer;
  const preset = {
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
};

export const getTracks = state => state.playlist.tracks;
const getTrackOrder = state => state.playlist.trackOrder;

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
  (tracks, trackOrder) => trackOrder.map(id => tracks[id])
);

export const getSelectedTrackObjects = createSelector(
  getOrderedTrackObjects,
  tracks => tracks.filter(track => track.selected)
);

// If a duration is `null`, it counts as zero, which seems fine enough.
const runningTimeFromTracks = tracks =>
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
export const getCurrentTrackIndex = state =>
  state.playlist.trackOrder.indexOf(state.playlist.currentTrack);

export const getCurrentTrackNumber = createSelector(
  getCurrentTrackIndex,
  currentTrackIndex => currentTrackIndex + 1
);

export const getCurrentTrackId = state => state.playlist.currentTrack;

export const nextTrack = (state, n = 1) => {
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
export const getNumberOfVisibleTracks = state => {
  const playlistSize = getWindowSize(state, "playlist");
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

const _getPlaylistScrollPosition = state =>
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
    return id => visibleTrackIds.includes(id);
  }
);

export const getVisibleTracks = createSelector(
  getVisibleTrackIds,
  getTracks,
  (visibleTrackIds, tracks) => visibleTrackIds.map(id => tracks[id])
);

export const getPlaylist = state => state.playlist;

export const getDuration = state => {
  const currentTrack = state.playlist.tracks[state.playlist.currentTrack];
  return currentTrack && currentTrack.duration;
};

export const getTrackDisplayName = (state, trackId) =>
  fromPlaylist.getTrackDisplayName(getPlaylist(state), trackId);

export const getCurrentTrackDisplayName = state => {
  const id = getCurrentTrackId(state);
  return getTrackDisplayName(state, id);
};

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

export const getNumberOfTracks = state => getTrackOrder(state).length;
const getPlaylistDuration = createSelector(getTracks, tracks =>
  Object.values(tracks).reduce((total, track) => total + track.duration, 0)
);

export const getPlaylistURL = createSelector(
  state => state,
  getNumberOfTracks,
  getPlaylistDuration,
  getTrackOrder,
  getTracks,
  (state, numberOfTracks, playlistDuration, trackOrder, tracks) =>
    createPlaylistURL({
      numberOfTracks,
      averageTrackLength: getTimeStr(playlistDuration / numberOfTracks),
      // TODO: Handle hours
      playlistLengthMinutes: Math.floor(playlistDuration / 60),
      playlistLengthSeconds: Math.floor(playlistDuration % 60),
      tracks: trackOrder.map(
        (id, i) =>
          `${i + 1}. ${getTrackDisplayName(state, id)} (${getTimeStr(
            tracks[id].duration
          )})`
      )
    })
);

export function getWindowPositions(state) {
  return state.windows.positions;
}

const WINDOW_HEIGHT = 116;
const SHADE_WINDOW_HEIGHT = 14;

function getWPixelSize(w, doubled) {
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

export function getWindowSize(state, windowId) {
  return state.windows.genWindows[windowId].size;
}

export function getWindowOpen(state) {
  return windowId => state.windows.genWindows[windowId].open;
}

export function getWindowShade(state, windowId) {
  return state.windows.genWindows[windowId].shade;
}

export function getWindowHidden(state) {
  return windowId => state.windows.genWindows[windowId].hidden;
}

export const getGenWindows = state => {
  return state.windows.genWindows;
};

export function getDoubled(state) {
  return state.display.doubled;
}

export const getWindowSizes = createSelector(
  getGenWindows,
  getDoubled,
  (windows, doubled) => {
    return objectMap(windows, w => getWPixelSize(w, doubled));
  }
);

export function getWindowPixelSize(state, windowId) {
  // Rather than compute it directly, we go via `getWindowSizes`
  // to take advantage of caching.
  return getWindowSizes(state)[windowId];
}

export const getWindowsInfo = createSelector(
  getWindowSizes,
  getWindowPositions,
  (sizes, positions) =>
    Object.keys(sizes).map(key => ({ key, ...sizes[key], ...positions[key] }))
);

export const getWindowGraph = createSelector(getWindowsInfo, generateGraph);

export const getSkinPlaylistStyle = state => {
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

export const getVisualizerStyle = state =>
  fromDisplay.getVisualizerStyle(state.display);
