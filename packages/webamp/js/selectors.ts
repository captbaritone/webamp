import {
  AppState,
  PlaylistTrack,
  WebampWindow,
  WindowId,
  WindowInfo,
  LoadedURLTrack,
  WindowPositions,
  PlaylistStyle,
  TransitionType,
  MediaStatus,
  TimeMode,
  SkinImages,
  Cursors,
  SkinRegion,
  GenLetterWidths,
  MilkdropMessage,
  DummyVizData,
} from "./types";
import { createSelector, defaultMemoize } from "reselect";
import * as Utils from "./utils";
import {
  BANDS,
  TRACK_HEIGHT,
  WINDOW_RESIZE_SEGMENT_WIDTH,
  WINDOW_RESIZE_SEGMENT_HEIGHT,
  WINDOW_WIDTH,
  MEDIA_STATUS,
  MEDIA_TAG_REQUEST_STATUS,
  WINDOWS,
  VISUALIZERS,
} from "./constants";
import { createPlaylistURL } from "./playlistHtml";
import * as fromTracks from "./reducers/tracks";
import * as fromDisplay from "./reducers/display";
import * as fromEqualizer from "./reducers/equalizer";
import * as fromMedia from "./reducers/media";
import * as fromWindows from "./reducers/windows";
import * as MarqueeUtils from "./marqueeUtils";
import { generateGraph } from "./resizeUtils";
import { SerializedStateV1 } from "./serializedStates/v1Types";

export const getSliders = (state: AppState) => state.equalizer.sliders;

export const getEqfData = createSelector(getSliders, (sliders) => {
  const preset: { [key: string]: number | string } = {
    name: "Entry1",
    preamp: Utils.denormalizeEqBand(sliders.preamp),
  };
  BANDS.forEach((band) => {
    preset[`hz${band}`] = Utils.denormalizeEqBand(sliders[band]);
  });
  const eqfData = {
    presets: [preset],
    type: "Winamp EQ library file v1.1",
  };
  return eqfData;
});

export const getTracks = (state: AppState) => state.tracks;
export const getTrackUrl = (state: AppState) => {
  return (id: number): string | null => {
    return state.tracks[id]?.url;
  };
};
export const getTrackOrder = (state: AppState) => state.playlist.trackOrder;

export const getTrackCount = createSelector(
  getTrackOrder,
  (trackOrder) => trackOrder.length
);

export const getOrderedTracks = createSelector(
  getTracks,
  getTrackOrder,
  (tracks, trackOrder) => trackOrder.filter((id) => tracks[id])
);

export const getUserTracks = createSelector(
  getTracks,
  getTrackOrder,
  (tracks, trackOrder) =>
    trackOrder.map((id) => {
      const track = tracks[id];

      return {
        url: track.url,
        metaData: {
          artist: track.artist || "",
          title: track.title || "",
          album: track.album,
          albumArtUrl: track.albumArtUrl || "",
        },
      };
    })
);

const getOrderedTrackObjects = createSelector(
  getTracks,
  getOrderedTracks,
  (tracks, trackOrder): PlaylistTrack[] => trackOrder.map((id) => tracks[id])
);

export const getSelectedTrackIds = (state: AppState): Set<number> => {
  return state.playlist.selectedTracks;
};

export const getSelectedTrackObjects = createSelector(
  getOrderedTrackObjects,
  getSelectedTrackIds,
  (tracks, selectedIds) => tracks.filter((track) => selectedIds.has(track.id))
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
    `${Utils.getTimeStr(selectedRunningTime)}/${Utils.getTimeStr(
      totalRunningTime
    )}`
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
  (currentTrackIndex) => currentTrackIndex + 1
);

export const getCurrentTrackId = (state: AppState) =>
  state.playlist.currentTrack;

// TODO: Sigh... Technically, we should detect if we are looping only repeat if we are.
// I think this would require pre-computing the "random" order of a playlist.
export const getRandomTrackId = (state: AppState): number | null => {
  const {
    playlist: { trackOrder, currentTrack },
  } = state;
  if (trackOrder.length === 0) {
    return null;
  }
  let nextId;
  do {
    nextId = trackOrder[Math.floor(trackOrder.length * Math.random())];
  } while (nextId === currentTrack && trackOrder.length > 1);
  return nextId;
};

export const getNextTrackId = (state: AppState, n = 1) => {
  const {
    playlist: { trackOrder },
    media: { repeat, shuffle },
  } = state;
  if (shuffle) {
    return getRandomTrackId(state);
  }
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

  nextIndex = Utils.clamp(nextIndex, 0, trackCount - 1);
  return trackOrder[nextIndex];
};

export const getGenWindows = (state: AppState) => {
  return state.windows.genWindows;
};

export const getWindowOpen = createSelector(getGenWindows, (genWindows) => {
  return (windowId: WindowId) => genWindows[windowId].open;
});

export const getWindowHidden = createSelector(
  getMilkdropWindowEnabled,
  (milkdropWindowEnabled) => {
    return (windowId: WindowId) => {
      return windowId === WINDOWS.MILKDROP && !milkdropWindowEnabled;
    };
  }
);

export const getWindowShade = createSelector(getGenWindows, (genWindows) => {
  return (windowId: WindowId) => genWindows[windowId].shade;
});

export const getWindowSize = createSelector(getGenWindows, (genWindows) => {
  return (windowId: WindowId) => genWindows[windowId].size;
});

export const getWindowPositions = createSelector(
  getGenWindows,
  (windows): WindowPositions => Utils.objectMap(windows, (w) => w.position)
);

const BASE_WINDOW_HEIGHT = 58;
export const getNumberOfVisibleTracks = createSelector(
  getWindowSize,
  (getWindowSize_) => {
    const playlistSize = getWindowSize_("playlist");
    return Math.floor(
      (BASE_WINDOW_HEIGHT + WINDOW_RESIZE_SEGMENT_HEIGHT * playlistSize[1]) /
        TRACK_HEIGHT
    );
  }
);

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
    return Utils.percentToIndex(playlistScrollPosition / 100, overflow + 1);
  }
);

export const getVisibleTrackIds = createSelector(
  getScrollOffset,
  getTrackOrder,
  getNumberOfVisibleTracks,
  (offset, trackOrder, numberOfVisibleTracks) =>
    trackOrder.slice(offset, offset + numberOfVisibleTracks)
);

export function getAllTracksAreVisible(state: AppState): boolean {
  return getVisibleTrackIds(state).length === state.playlist.trackOrder.length;
}

export const getTrackIsVisibleFunction = createSelector(
  getVisibleTrackIds,
  (visibleTrackIds) => {
    return (id: number) => visibleTrackIds.includes(id);
  }
);

export const getVisibleTracks = createSelector(
  getVisibleTrackIds,
  getTracks,
  (visibleTrackIds, tracks) => visibleTrackIds.map((id) => tracks[id])
);

export const getPlaylist = (state: AppState) => state.playlist;

export const getDuration = (state: AppState): number | null => {
  const { playlist, tracks } = state;
  if (playlist.currentTrack == null) {
    return null;
  }
  const currentTrack = tracks[playlist.currentTrack];
  return currentTrack && currentTrack.duration;
};

export const getTrackDisplayName = createSelector(getTracks, (tracks) => {
  return defaultMemoize((trackId: number | null) =>
    fromTracks.getTrackDisplayName(tracks, trackId)
  );
});

export const getCurrentTrackDisplayName = createSelector(
  getCurrentTrackId,
  getTrackDisplayName,
  (id, getName) => {
    return getName(id);
  }
);

export const getMediaStatus = (state: AppState): MediaStatus | null => {
  return state.media.status;
};

export const getMediaIsPlaying = (state: AppState) =>
  state.media.status === MEDIA_STATUS.PLAYING;

export const getCurrentTrack = createSelector(
  getCurrentTrackId,
  getTracks,
  (trackId, tracks): PlaylistTrack | null => {
    return trackId == null ? null : tracks[trackId];
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
        albumArtUrl: track.albumArtUrl || null,
      },
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
      : `${minimalMediaText} (${Utils.getTimeStr(duration)})`
);

export const getNumberOfTracks = (state: AppState) =>
  getTrackOrder(state).length;
const getPlaylistDuration = createSelector(getTracks, (tracks) =>
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
      averageTrackLength: Utils.getTimeStr(playlistDuration / numberOfTracks),
      // TODO: Handle hours
      playlistLengthMinutes: Math.floor(playlistDuration / 60),
      playlistLengthSeconds: Math.floor(playlistDuration % 60),
      tracks: trackOrder.map(
        (id, i) =>
          `${i + 1}. ${getDisplayName(id)} (${Utils.getTimeStr(
            tracks[id].duration
          )})`
      ),
    })
);

const WINDOW_HEIGHT = 116;
const SHADE_WINDOW_HEIGHT = 14;

function getWPixelSize(w: WebampWindow, doubled: boolean) {
  const [width, height] = w.size;
  const doubledMultiplier = doubled && w.canDouble ? 2 : 1;
  const pix = {
    height: WINDOW_HEIGHT + height * WINDOW_RESIZE_SEGMENT_HEIGHT,
    width: WINDOW_WIDTH + width * WINDOW_RESIZE_SEGMENT_WIDTH,
  };
  return {
    height: (w.shade ? SHADE_WINDOW_HEIGHT : pix.height) * doubledMultiplier,
    width: pix.width * doubledMultiplier,
  };
}

export function getFocusedWindow(state: AppState): WindowId | null {
  return state.windows.focused;
}

export function getWindowPosition(state: AppState) {
  return (windowId: WindowId) => state.windows.genWindows[windowId].position;
}

export function getPositionsAreRelative(state: AppState) {
  return state.windows.positionsAreRelative;
}

export function getDoubled(state: AppState) {
  return state.display.doubled;
}

export function getLlamaMode(state: AppState) {
  return state.display.llama;
}

export function getZIndex(state: AppState): number {
  return state.display.zIndex;
}

// TODO: This is poorly memoized. It invalidates when a window moves.
export const getWindowSizes = createSelector(
  getGenWindows,
  getDoubled,
  (windows, doubled) => {
    return Utils.objectMap(windows, (w) => getWPixelSize(w, doubled));
  }
);

export const getWindowPixelSize = createSelector(getWindowSizes, (sizes) => {
  return (windowId: WindowId) => sizes[windowId];
});

const getWindowOrder = (state: AppState): WindowId[] =>
  state.windows.windowOrder;

export const getNormalizedWindowOrder = createSelector(
  getWindowOrder,
  getGenWindows,
  (windowOrder, genWindows): WindowId[] => {
    return [
      WINDOWS.MAIN,
      ...windowOrder.filter(
        (windowId) => windowId !== WINDOWS.MAIN && genWindows[windowId] != null
      ),
    ];
  }
);

// TODO: Now that both size and position are stored on genWindows this seems a bit silly.
export const getWindowsInfo = createSelector(
  getWindowSizes,
  getWindowPositions,
  getNormalizedWindowOrder,
  (sizes, positions, windowOrder): WindowInfo[] => {
    return windowOrder.map((key) => ({
      key,
      ...sizes[key],
      ...positions[key],
    }));
  }
);

export const getWindowGraph = createSelector(getWindowsInfo, generateGraph);

const defaultPlaylistStyle = {
  normal: "#00FF00",
  current: "#FFFFFF",
  normalbg: "#000000",
  selectedbg: "#0000C6",
  font: "Arial",
};

export function getSkinColors(state: AppState): string[] {
  return state.display.skinColors;
}

export const getSkinPlaylistStyle = (state: AppState): PlaylistStyle => {
  return state.display.skinPlaylistStyle || defaultPlaylistStyle;
};

export const getVisualizerStyle = (state: AppState): string => {
  const milkdrop = state.windows.genWindows[WINDOWS.MILKDROP];
  if (milkdrop != null && milkdrop.open) {
    return VISUALIZERS.MILKDROP;
  }
  return fromDisplay.getVisualizerStyle(state.display);
};

export const getVolume = (state: AppState) => state.media.volume;
export const getBalance = (state: AppState) => state.media.balance;
export const getShuffle = (state: AppState) => state.media.shuffle;
export const getRepeat = (state: AppState) => state.media.repeat;

export const getChannels = createSelector(
  getCurrentTrack,
  (track: PlaylistTrack | null): number | null => {
    return track != null ? track.channels || null : null;
  }
);

export const getTimeElapsed = (state: AppState): number => {
  return state.media.timeElapsed;
};

export function getSerlializedState(state: AppState): SerializedStateV1 {
  return {
    version: 1,
    media: fromMedia.getSerializedState(state.media),
    equalizer: fromEqualizer.getSerializedState(state.equalizer),
    display: fromDisplay.getSerializedState(state.display),
    windows: fromWindows.getSerializedState(state.windows),
  };
}

export function getEqualizerEnabled(state: AppState): boolean {
  return state.equalizer.on;
}

export function getEqualizerAuto(state: AppState): boolean {
  return state.equalizer.auto;
}

export function getBrowserWindowSize(state: AppState): {
  height: number;
  width: number;
} {
  return state.windows.browserWindowSize;
}

export const getOpenWindows = createSelector(getGenWindows, (genWindows) =>
  Utils.objectFilter(genWindows, (w) => w.open)
);

export const getStackedLayoutPositions = createSelector(
  getOpenWindows,
  getDoubled,
  (openWindows, doubled): WindowPositions => {
    let offset = 0;
    return Utils.objectMap(openWindows, (w) => {
      const position = { x: 0, y: offset };
      offset += getWPixelSize(w, doubled).height;
      return position;
    });
  }
);

export const getUserInputFocus = (state: AppState): string | null => {
  return state.userInput.focus;
};

export const getUserInputScrubPosition = (state: AppState): number => {
  return state.userInput.scrubPosition;
};
// TODO: Make this a reselect selector
export const getMarqueeText = (state: AppState): string => {
  const defaultText = "Winamp 2.91";
  if (state.userInput.userMessage != null) {
    return state.userInput.userMessage;
  }
  switch (getUserInputFocus(state)) {
    case "balance":
      return MarqueeUtils.getBalanceText(state.media.balance);
    case "volume":
      return MarqueeUtils.getVolumeText(state.media.volume);
    case "position":
      const duration = getDuration(state);
      if (duration == null) {
        // This probably can't ever happen.
        return defaultText;
      }
      return MarqueeUtils.getPositionText(
        duration,
        getUserInputScrubPosition(state)
      );
    case "double":
      return MarqueeUtils.getDoubleSizeModeText(state.display.doubled);
    case "eq":
      const band = state.userInput.bandFocused;
      if (band == null) {
        // This probably can't ever happen.
        return defaultText;
      }
      return MarqueeUtils.getEqText(band, state.equalizer.sliders[band]);
    default:
      break;
  }
  if (state.playlist.currentTrack != null) {
    const mediaText = getMediaText(state);
    if (mediaText == null) {
      // This probably can't ever happen.
      return defaultText;
    }
    return mediaText;
  }
  return defaultText;
};

export const getKbps = createSelector(
  getCurrentTrack,
  (track: PlaylistTrack | null): string | null => {
    return track != null ? track.kbps || null : null;
  }
);

export const getKhz = createSelector(
  getCurrentTrack,
  (track: PlaylistTrack | null): string | null => {
    return track != null ? track.khz || null : null;
  }
);

export function getMilkdropMessage(state: AppState): MilkdropMessage | null {
  return state.milkdrop.message;
}

export function getMilkdropWindowEnabled(state: AppState): boolean {
  return state.milkdrop.display === "WINDOW";
}

export function getMilkdropDesktopEnabled(state: AppState): boolean {
  return state.milkdrop.display === "DESKTOP";
}

export function getMilkdropFullscreenEnabled(state: AppState): boolean {
  return state.milkdrop.display === "FULLSCREEN";
}

export function getPresets(state: AppState): any {
  return state.milkdrop.presets;
}

export function getButterchurn(state: AppState): any {
  return state.milkdrop.butterchurn;
}

export function getPresetTransitionType(state: AppState): TransitionType {
  return state.milkdrop.transitionType;
}

export function getCurrentPresetIndex(state: AppState): number | null {
  return state.milkdrop.currentPresetIndex;
}
export function getCurrentPreset(state: AppState): any | null {
  const index = getCurrentPresetIndex(state);
  if (index == null) {
    return null;
  }
  const preset = state.milkdrop.presets[index];
  if (preset == null || preset.type === "UNRESOLVED") {
    return null;
  }
  return preset.preset;
}

export function getPresetNames(state: AppState): string[] {
  return state.milkdrop.presets.map((preset) => preset.name);
}

export function getPresetOverlayOpen(state: AppState): boolean {
  return state.milkdrop.overlay;
}

export function getPresetsAreCycling(state: AppState): boolean {
  return state.milkdrop.cycling;
}

export function getRandomizePresets(state: AppState): boolean {
  return state.milkdrop.randomize;
}

export function getClosed(state: AppState): boolean {
  return state.display.closed;
}

export function getSkinImages(state: AppState): SkinImages {
  return state.display.skinImages;
}

export function getSkinCursors(state: AppState): Cursors | null {
  return state.display.skinCursors;
}

export function getSkinRegion(state: AppState): SkinRegion {
  return state.display.skinRegion;
}

export function getSkinLetterWidths(state: AppState): GenLetterWidths | null {
  return state.display.skinGenLetterWidths;
}

export function getPreampLineUrl(state: AppState): string | null {
  return state.display.skinImages.EQ_PREAMP_LINE;
}

export function getLineColorsUrl(state: AppState): string | null {
  return state.display.skinImages.EQ_GRAPH_LINE_COLORS;
}

export const getPreampLineImage = createSelector(
  getPreampLineUrl,
  async (url): Promise<HTMLImageElement | null> => {
    if (url == null) {
      return null;
    }
    return Utils.imgFromUrl(url);
  }
);

export const getLineColorsImage = createSelector(
  getLineColorsUrl,
  async (url): Promise<HTMLImageElement | null> => {
    if (url == null) {
      return null;
    }
    return Utils.imgFromUrl(url);
  }
);

export function getDummyVizData(state: AppState): DummyVizData | null {
  return state.display.dummyVizData;
}

export function getMarqueeStep(state: AppState): number {
  return state.display.marqueeStep;
}

export function getNetworkConnected(state: AppState): boolean {
  return state.network.connected;
}

export function getTimeMode(state: AppState): TimeMode {
  return state.media.timeMode;
}

export function getLoading(state: AppState): boolean {
  return state.display.loading;
}

export function getWorking(state: AppState): boolean {
  return state.display.working;
}

export function getAvaliableSkins(state: AppState) {
  return state.settings.availableSkins;
}
