import * as Utils from "../utils";
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
  const skinHashes = getSkinHashes(state);
  const searchQuery = getSearchQuery(state);
  if (searchQuery == null || state.matchingHashes == null) {
    return skinHashes;
  }
  return skinHashes.filter(hash => state.matchingHashes.has(hash));
}

export function getRandomSkinHash(state) {
  const skinHashes = getSkinHashes(state);
  const numberOfSkins = skinHashes.length;
  const randomIndex = Math.floor(Math.random() * numberOfSkins);
  return skinHashes[randomIndex];
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

// TODO: This could be memoized
export function getSkinHashes(state) {
  return Object.keys(getSkins(state));
}

export function getSkins(state) {
  return state.skins;
}
