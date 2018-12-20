import * as Utils from "../utils";
import skins from "../skins.json";
import { ABOUT_PAGE } from "../constants";

export function getSelectedSkinHash(state) {
  return state.selectedSkinHash;
}

export function getSelectedSkinPosition(state) {
  return state.selectedSkinPosition;
}

export function overlayShouldAnimate(state) {
  return getSelectedSkinPosition(state) != null;
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
  if (searchQuery == null || state.matchingHashes == null) {
    return hashes;
  }
  return hashes.filter(hash => state.matchingHashes.has(hash));
}

export function getRandomSkinHash() {
  const keys = Object.keys(skins);
  const numberOfSkins = keys.length;
  const randomIndex = Math.floor(Math.random() * numberOfSkins);
  return keys[randomIndex];
}

export function getUrl(state) {
  if (state.activeContentPage === ABOUT_PAGE) {
    return "/about/";
  }
  const hash = getSelectedSkinHash(state);
  const query = getSearchQuery(state);
  if (hash) {
    // TODO: Add a human readable version
    return Utils.getPermalinkUrlFromHash(hash);
  } else if (query) {
    return `/?query=${encodeURIComponent(query)}`;
  }
  return "/";
}

export function getPageTitle(state) {
  return "Winamp Skin Museum";
}

export function getPreviewImageUrl(state) {
  const hash = getSelectedSkinHash(state);
  return hash == null ? null : Utils.screenshotUrlFromHash(hash);
}

export function getActiveContentPage(state) {
  return state.activeContentPage;
}
