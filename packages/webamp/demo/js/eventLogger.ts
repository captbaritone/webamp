import { log } from "./logger";
import WebmapLazy from "../../js/webampLazy";
import * as Selectors from "../../js/selectors";

export function attachLogger(webamp: WebmapLazy) {
  const { store } = webamp;
  webamp._actionEmitter.on("IS_PLAYING", () => {
    log({
      category: "Media",
      action: "IsPlaying",
      label:
        Selectors.getCurrentTrackDisplayName(store.getState()) ?? "[UNKNOWN]",
    });
  });
  webamp._actionEmitter.on("PAUSE", () => {
    log({
      category: "Media",
      action: "Pause",
      label:
        Selectors.getCurrentTrackDisplayName(store.getState()) ?? "[UNKNOWN]",
    });
  });
  webamp._actionEmitter.on("STOP", () => {
    log({
      category: "Media",
      action: "Stop",
      label:
        Selectors.getCurrentTrackDisplayName(store.getState()) ?? "[UNKNOWN]",
    });
  });
  webamp._actionEmitter.on("TOGGLE_REPEAT", () => {
    log({
      category: "Media",
      action: "ToggleRepeat",
    });
  });
  webamp._actionEmitter.on("TOGGLE_SHUFFLE", () => {
    log({
      category: "Media",
      action: "ToggleShuffle",
    });
  });
  webamp._actionEmitter.on("TOGGLE_DOUBLESIZE_MODE", () => {
    log({
      category: "Display",
      action: "ToggleDoublesizeMode",
    });
  });
  webamp._actionEmitter.on("TOGGLE_VISUALIZER_STYLE", () => {
    log({
      category: "Display",
      action: "ToggleVisualizerStyle",
    });
  });
  webamp._actionEmitter.on("SET_SKIN_DATA", () => {
    log({
      category: "Display",
      action: "SetSkinData",
    });
  });
  webamp._actionEmitter.on("CLOSE_WINAMP", () => {
    log({
      category: "Display",
      action: "CloseWinamp",
    });
  });
  webamp._actionEmitter.on("OPEN_WINAMP", () => {
    log({
      category: "Display",
      action: "OpenWinamp",
    });
  });
  webamp._actionEmitter.on("SET_MILKDROP_DESKTOP", () => {
    log({
      category: "Milkdrop",
      action: "SetMilkdropDesktop",
    });
  });
  webamp._actionEmitter.on("SET_MILKDROP_FULLSCREEN", () => {
    log({
      category: "Milkdrop",
      action: "SetMilkdropFullscreen",
    });
  });

  webamp._actionEmitter.on("TOGGLE_PRESET_OVERLAY", () => {
    log({
      category: "Milkdrop",
      action: "TogglePresetOverlay",
    });
  });
  webamp._actionEmitter.on("TOGGLE_RANDOMIZE_PRESETS", () => {
    log({
      category: "Milkdrop",
      action: "ToggleRandomizePresets",
    });
  });
  webamp._actionEmitter.on("TOGGLE_PRESET_CYCLING", () => {
    log({
      category: "Milkdrop",
      action: "TogglePresetCycling",
    });
  });
  webamp._actionEmitter.on("CLICKED_TRACK", () => {
    log({
      category: "Playlist",
      action: "ClickedTrack",
    });
  });
  webamp._actionEmitter.on("CTRL_CLICKED_TRACK", () => {
    log({
      category: "Playlist",
      action: "CtrlClickedTrack",
    });
  });
  webamp._actionEmitter.on("SHIFT_CLICKED_TRACK", () => {
    log({
      category: "Playlist",
      action: "ShiftClickedTrack",
    });
  });
  webamp._actionEmitter.on("SELECT_ALL", () => {
    log({
      category: "Playlist",
      action: "SelectAll",
    });
  });
  webamp._actionEmitter.on("SELECT_ZERO", () => {
    log({
      category: "Playlist",
      action: "SelectZero",
    });
  });
  webamp._actionEmitter.on("INVERT_SELECTION", () => {
    log({
      category: "Playlist",
      action: "InvertSelection",
    });
  });
  /* This is triggered programatically when you load a new track
  webamp._actionEmitter.on("REMOVE_ALL_TRACKS", () => {
    log({
      category: "Playlist",
      action: "RemoveAllTracks",
    });
  });
  */
  webamp._actionEmitter.on("REVERSE_LIST", () => {
    log({
      category: "Playlist",
      action: "ReverseList",
    });
  });
  webamp._actionEmitter.on("RANDOMIZE_LIST", () => {
    log({
      category: "Playlist",
      action: "RandomizeList",
    });
  });
  webamp._actionEmitter.on("ENABLE_MILKDROP", () => {
    log({
      category: "Windows",
      action: "EnableMilkdrop",
    });
  });
  webamp._actionEmitter.on("TOGGLE_WINDOW_SHADE_MODE", (action) => {
    log({
      category: "Windows",
      action: "ToggleWindowShadeMode",
      label: action.windowId,
    });
  });
  webamp._actionEmitter.on("TOGGLE_WINDOW", (action) => {
    log({
      category: "Windows",
      action: "ToggleWindow",
      label: action.windowId,
    });
  });
  webamp._actionEmitter.on("CLOSE_WINDOW", (action) => {
    log({
      category: "Windows",
      action: "CloseWindow",
      label: action.windowId,
    });
  });
  webamp._actionEmitter.on("SET_WINDOW_VISIBILITY", (action) => {
    log({
      category: "Windows",
      action: "CloseWindow",
      label: `${action.windowId}:${action.hidden ? "hidden" : "visibile"}`,
    });
  });
  webamp._actionEmitter.on("MAIN_CONTEXT_MENU_OPENED", () => {
    log({
      category: "ContextMenu",
      action: "MainContextMenuOpened",
    });
  });
  webamp._actionEmitter.on("DROPPED_FILES", (action) => {
    log({
      category: "DroppedFiles",
      action: action.windowId,
      label: action.firstFileName ?? "[UNKNOWN]",
      value: action.count,
    });
  });
  webamp._actionEmitter.on("OPENED_FILES", (action) => {
    log({
      category: "OpenedFiles",
      action: action.expectedType,
      label: action.firstFileName ?? "[UNKNOWN]",
      value: action.count,
    });
  });
  webamp._actionEmitter.on("TOGGLE_LLAMA_MODE", () => {
    log({
      category: "Hotkeys",
      action: "ToggledLlamaMode",
    });
  });
}
