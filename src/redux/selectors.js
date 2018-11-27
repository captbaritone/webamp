import * as Utils from "../utils";
import skins from "../skins.json";

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

export function getSearchQuery(state) {
  return state.searchQuery;
}

// TODO: Memoize this very expensive function
export function getMatchingSkinHashes(state) {
  const hashes = Object.keys(skins);
  const searchQuery = getSearchQuery(state);
  if (searchQuery == null) {
    return hashes;
  }
  const normalizedSearchQuery = searchQuery.toLowerCase();
  return hashes.filter(hash => {
    const { fileName } = skins[hash];
    return fileName.toLowerCase().includes(normalizedSearchQuery);
  });
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
