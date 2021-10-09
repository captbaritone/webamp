import {
  Band,
  MediaTagRequestStatus,
  MediaStatus,
  LoadStyle,
  TimeMode,
} from "./types";
import baseSkin from "./baseSkin.json";
export const BANDS: Band[] = [
  60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000,
];

export const WINDOWS = {
  MAIN: "main",
  PLAYLIST: "playlist",
  EQUALIZER: "equalizer",
  MILKDROP: "milkdrop",
};

export const LOAD_STYLE: Record<LoadStyle, LoadStyle> = {
  BUFFER: "BUFFER",
  PLAY: "PLAY",
  NONE: "NONE",
};

// TODO: Make this an enum?
export const MEDIA_TAG_REQUEST_STATUS: Record<
  MediaTagRequestStatus,
  MediaTagRequestStatus
> = {
  INITIALIZED: "INITIALIZED",
  FAILED: "FAILED",
  COMPLETE: "COMPLETE",
  NOT_REQUESTED: "NOT_REQUESTED",
};

export const UTF8_ELLIPSIS = "\u2026";
export const CHARACTER_WIDTH = 5;
export const WINDOW_RESIZE_SEGMENT_WIDTH = 25;
export const WINDOW_RESIZE_SEGMENT_HEIGHT = 29;
export const WINDOW_HEIGHT = 116;
export const WINDOW_WIDTH = 275;
export const TRACK_HEIGHT = 13;
export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const DEFAULT_SKIN = baseSkin;

export const VISUALIZERS = {
  OSCILLOSCOPE: "OSCILLOSCOPE",
  BAR: "BAR",
  NONE: "NONE",
  MILKDROP: "MILKDROP",
};

export const VISUALIZER_ORDER = [
  VISUALIZERS.BAR,
  VISUALIZERS.OSCILLOSCOPE, // TODO: Verify the order
  VISUALIZERS.NONE,
];

export const TIME_MODE: Record<TimeMode, TimeMode> = {
  ELAPSED: "ELAPSED",
  REMAINING: "REMAINING",
};

// TODO: Convert to enum once we are fully Typescript
export const MEDIA_STATUS: Record<MediaStatus, MediaStatus> = {
  PLAYING: "PLAYING",
  STOPPED: "STOPPED",
  PAUSED: "PAUSED",
};
