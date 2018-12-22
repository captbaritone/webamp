import { createSelector } from "reselect";
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

export const getSelectedSkinUrl = createSelector(
  getSelectedSkinHash,
  hash => {
    return hash == null ? null : Utils.screenshotUrlFromHash(hash);
  }
);

export function getSearchQuery(state) {
  return state.searchQuery;
}

export function getMatchingHashes(state) {
  return state.matchingHashes;
}

export const getSkinHashes = createSelector(
  getSkins,
  skins => Object.keys(skins)
);

export const getMatchingSkinHashes = createSelector(
  getSkinHashes,
  getSearchQuery,
  getMatchingHashes,
  (skinHashes, searchQuery, matchingHashes) => {
    if (searchQuery == null || matchingHashes == null) {
      return skinHashes;
    }
    return skinHashes.filter(hash => matchingHashes.has(hash));
  }
);

// We should be careful _not_ to memoize this function since it's non determinisitc
export function getRandomSkinHash(state) {
  const skinHashes = getSkinHashes(state);
  const numberOfSkins = skinHashes.length;
  const randomIndex = Math.floor(Math.random() * numberOfSkins);
  return skinHashes[randomIndex];
}

export const getUrl = createSelector(
  getActiveContentPage,
  getSelectedSkinHash,
  getSearchQuery,
  (activeContentPage, hash, query) => {
    if (activeContentPage === ABOUT_PAGE) {
      return "/about/";
    }
    if (hash) {
      // TODO: Add a human readable version
      return Utils.getPermalinkUrlFromHash(hash);
    } else if (query) {
      return `/?query=${encodeURIComponent(query)}`;
    }
    return "/";
  }
);

export function getPageTitle(state) {
  return "Winamp Skin Museum";
}

export const getPreviewImageUrl = createSelector(
  getSelectedSkinHash,
  hash => {
    return hash == null ? null : Utils.screenshotUrlFromHash(hash);
  }
);

export function getActiveContentPage(state) {
  return state.activeContentPage;
}

export function getSkins(state) {
  return state.skins;
}
