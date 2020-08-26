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
}
