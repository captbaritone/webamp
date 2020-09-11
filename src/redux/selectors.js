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
  (hash) => {
    return hash == null ? null : Utils.screenshotUrlFromHash(hash);
  }
);

export function getSearchQuery(state) {
  return state.searchQuery;
}

export function getMatchingSkins(state) {
  return state.matchingSkins;
}

export const getSkinHashes = (state) => {
  return state.defaultSkins;
};

export const getCurrentSkinCount = createSelector(
  getMatchingSkins,
  (state) => state.totalNumberOfSkins,
  (matchingSkins, totalNumberOfSkins) => {
    return matchingSkins == null ? totalNumberOfSkins : matchingSkins.length;
  }
);

export const getFileToUpload = (state) => {
  return Object.values(state.fileUploads).find(
    (file) => file.status === "MISSING"
  );
};

export const getHaveUploadFiles = (state) =>
  Object.keys(state.fileUploads).length > 0;

/**
 * Skin Interface
 * {
 *    data: {
 *     hash: string,
 *     fileName: string,
 *     color: string,
 *    } | null,
 *    requestToken: string | number
 * }
 */

export const getSkinDataGetter = createSelector(
  getSkins,
  getSkinHashes,
  getMatchingSkins,
  (skins, skinHashes, matchingSkins) => {
    return ({ columnIndex, columnCount, rowIndex }) => {
      const index = rowIndex * columnCount + columnIndex;
      if (matchingSkins) {
        const data = matchingSkins[index];
        return { data };
      }
      const hash = skinHashes[index];
      if (hash == null) {
        return { data: null, requestToken: index };
      }
      const { fileName, color, nsfw } = skins[hash];
      return { data: { fileName, color, hash, nsfw } };
    };
  }
);

export const getMatchingSkinHashes = createSelector(
  getSkinHashes,
  getSearchQuery,
  getMatchingSkins,
  (skinHashes, searchQuery, matchingSkins) => {
    if (searchQuery == null || matchingSkins == null) {
      return skinHashes;
    }
    return matchingSkins.map((skin) => skin.hash);
  }
);

// We should be careful _not_ to memoize this function since it's non determinisitc
export function getRandomSkinHash(state) {
  const skinHashes = getMatchingSkinHashes(state);
  const numberOfSkins = skinHashes.length;
  const randomIndex = Math.floor(Math.random() * numberOfSkins);
  return skinHashes[randomIndex];
}

export const getPermalinkUrlFromHashGetter = createSelector(
  getSkins,
  (skins) => {
    return (hash) => {
      const skin = skins[hash];
      if (skin == null || skin.fileName == null) {
        return `/skin/${hash}/`;
      }
      return `/skin/${hash}/${skin.fileName}/`;
    };
  }
);

export const getAbsolutePermalinkUrlFromHashGetter = createSelector(
  getPermalinkUrlFromHashGetter,
  (getPermalinkUrlFromHash) => {
    return (hash) => {
      return window.location.origin + getPermalinkUrlFromHash(hash);
    };
  }
);

export const getUrl = createSelector(
  getActiveContentPage,
  getSelectedSkinHash,
  getSearchQuery,
  getFileExplorerOpen,
  getFocusedSkinFile,
  getSkins,
  getPermalinkUrlFromHashGetter,
  (
    activeContentPage,
    hash,
    query,
    fileExplorerOpen,
    focusedSkinFile,
    skins,
    getPermalinkUrlFromHash
  ) => {
    if (activeContentPage === ABOUT_PAGE) {
      return "/about/";
    }
    if (hash) {
      const skinUrl = getPermalinkUrlFromHash(hash);
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
  (hash) => {
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

export function getAreReadyToCheckMissingUploads(state) {
  return Object.values(state.fileUploads).every(
    (file) => file.invalid || file.md5 != null
  );
}

export function getUploadedFilesMd5s(state) {
  return Object.values(state.fileUploads)
    .map((file) => file.md5)
    .filter(Boolean);
}
