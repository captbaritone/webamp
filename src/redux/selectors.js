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
  skins => {
    const hashes = Object.keys(skins);
    hashes.sort((a, b) => {
      const aFaves = skins[a].favorites;
      const bFaves = skins[b].favorites;
      const res = (bFaves || 0) - (aFaves || 0);
      return res;
    });
    return hashes;
  }
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
  const matchingHashes = getMatchingHashes(state);
  const skinHashes = matchingHashes
    ? Array.from(matchingHashes)
    : getSkinHashes(state);
  const numberOfSkins = skinHashes.length;
  const randomIndex = Math.floor(Math.random() * numberOfSkins);
  return skinHashes[randomIndex];
}

export const getUrl = createSelector(
  getActiveContentPage,
  getSelectedSkinHash,
  getSearchQuery,
  getFileExplorerOpen,
  getFocusedSkinFile,
  (activeContentPage, hash, query, fileExplorerOpen, focusedSkinFile) => {
    if (activeContentPage === ABOUT_PAGE) {
      return "/about/";
    }
    if (hash) {
      // TODO: Add a human readable version
      const skinUrl = Utils.getPermalinkUrlFromHash(hash);
      if (fileExplorerOpen && focusedSkinFile) {
        return `${skinUrl}files/${encodeURIComponent(
          focusedSkinFile.fileName
        )}`;
      }
      return skinUrl;
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

export function getFileExplorerOpen(state) {
  return state.fileExplorerOpen;
}

export function getFocusedSkinFile(state) {
  return state.focusedSkinFile;
}
