import { log, GoogleAnalyticsEvent } from "./logger";
import { Action } from "./Webamp";

function logEventFromAction(action: Action): GoogleAnalyticsEvent | null {
  switch (action.type) {
    case "IS_PLAYING": {
      return { category: "Media", action: "IsPlaying" };
    }
    case "PAUSE": {
      return { category: "Media", action: "Pause" };
    }
    case "STOP": {
      return { category: "Media", action: "Stop" };
    }
    case "TOGGLE_REPEAT":
      return { category: "Media", action: "ToggleRepeat" };
    case "TOGGLE_SHUFFLE":
      return { category: "Media", action: "ToggleShuffle" };
    case "TOGGLE_DOUBLESIZE_MODE":
      return { category: "Display", action: "ToggleDoublesizeMode" };
    case "TOGGLE_VISUALIZER_STYLE":
      return { category: "Display", action: "ToggleVisualizerStyle" };
    case "SET_SKIN_DATA":
      return { category: "Display", action: "SetSkinData" };
    case "CLOSE_WINAMP":
      return { category: "Display", action: "CloseWinamp" };
    case "OPEN_WINAMP":
      return { category: "Display", action: "OpenWinamp" };
    case "SET_MILKDROP_DESKTOP":
      return { category: "Milkdrop", action: "SetMilkdropDesktop" };
    case "SET_MILKDROP_FULLSCREEN":
      return { category: "Milkdrop", action: "SetMilkdropFullscreen" };
    case "TOGGLE_PRESET_OVERLAY":
      return { category: "Milkdrop", action: "TogglePresetOverlay" };
    case "TOGGLE_RANDOMIZE_PRESETS":
      return { category: "Milkdrop", action: "ToggleRandomizePresets" };
    case "TOGGLE_PRESET_CYCLING":
      return { category: "Milkdrop", action: "TogglePresetCycling" };
    case "CLICKED_TRACK":
      return { category: "Playlist", action: "ClickedTrack" };
    case "CTRL_CLICKED_TRACK":
      return { category: "Playlist", action: "CtrlClickedTrack" };
    case "SHIFT_CLICKED_TRACK":
      return { category: "Playlist", action: "ShiftClickedTrack" };
    case "SELECT_ALL":
      return { category: "Playlist", action: "SelectAll" };
    case "SELECT_ZERO":
      return { category: "Playlist", action: "SelectZero" };
    case "INVERT_SELECTION":
      return { category: "Playlist", action: "InvertSelection" };
    /* This is triggered programatically when you load a new track
    case "REMOVE_ALL_TRACKS":
      return {
        category: "Playlist",
        action: "RemoveAllTracks",
      };
    */
    case "REVERSE_LIST":
      return { category: "Playlist", action: "ReverseList" };
    case "RANDOMIZE_LIST":
      return { category: "Playlist", action: "RandomizeList" };
    case "ENABLE_MILKDROP":
      return { category: "Windows", action: "EnableMilkdrop" };
    case "TOGGLE_WINDOW_SHADE_MODE":
      return {
        category: "Windows",
        action: "ToggleWindowShadeMode",
        label: action.windowId,
      };
    case "TOGGLE_WINDOW":
      return {
        category: "Windows",
        action: "ToggleWindow",
        label: action.windowId,
      };
    case "CLOSE_WINDOW":
      return {
        category: "Windows",
        action: "CloseWindow",
        label: action.windowId,
      };
    case "SET_WINDOW_VISIBILITY":
      return {
        category: "Windows",
        action: "CloseWindow",
        label: `${action.windowId}:${action.hidden ? "hidden" : "visibile"}`,
      };
    case "MAIN_CONTEXT_MENU_OPENED":
      return { category: "ContextMenu", action: "MainContextMenuOpened" };
    case "DROPPED_FILES":
      return {
        category: "DroppedFiles",
        action: action.windowId,
        label: action.firstFileName ?? "[UNKNOWN]",
        value: action.count,
      };
    case "OPENED_FILES":
      return {
        category: "OpenedFiles",
        action: action.expectedType,
        label: action.firstFileName ?? "[UNKNOWN]",
        value: action.count,
      };
    case "TOGGLE_LLAMA_MODE":
      return { category: "Hotkeys", action: "ToggledLlamaMode" };
  }
  return null;
}

export const loggerMiddleware =
  () => (next: (action: Action) => void) => (action: Action) => {
    const event = logEventFromAction(action);
    if (event != null) {
      log(event);
    }
    return next(action);
  };
