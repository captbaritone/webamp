import * as Utils from "../utils";

export function getSelectedSkinHash(state) {
  return state.selectedSkinHash;
}

export function getSelectedSkinPosition(state) {
  return state.selectedSkinPosition;
}

export function getSelectedSkinUrl(state) {
  const hash = getSelectedSkinHash(state);
  return hash == null ? null : Utils.screenshotUrlFromHash(hash);
}

export function getUrl(state) {
  if (state.selectedSkinHash) {
    // TODO: Add a human readable version
    return `/skin/${getSelectedSkinHash(state)}/`;
  } else {
    return "/";
  }
}

export function getPageTitle(state) {
  return "Winamp Skins";
}
