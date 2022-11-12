import { createSelector } from "reselect";
// import * as Utils from "../utils";
import { ABOUT_PAGE, UPLOAD_PAGE, REVIEW_PAGE } from "../constants";

export function getSelectedSkinHash(state) {
  return state.selectedSkinHash;
}

export function getSelectedSkinPosition(state) {
  return state.selectedSkinPosition;
}

export function getSelectedSkinData(state) {
  const hash = getSelectedSkinHash(state);
  if (hash == null) {
    return null;
  }

  return state.skins[hash] || null;
}

export function overlayShouldAnimate(state) {
  return getSelectedSkinPosition(state) != null;
}

export function getSearchQuery(state) {
  return state.searchQuery;
}

export function getLoadingSearchQuery(state) {
  return state.loadingSearchResults;
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

export const getFilesToUpload = (state) => {
  return Object.values(state.fileUploads).filter((file) => {
    if (file == null) {
      console.warn("Got a nullish file");
      return false;
    }
    return file.status === "MISSING";
  });
};

export const getUploadViewOpen = (state) => {
  return state.activeContentPage === UPLOAD_PAGE;
};

export const getAreDragging = (state) => state.areDragging;

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
  getDebugViewOpen,
  (skins, debugViewOpen) => {
    return (hash) => {
      const skin = skins[hash];

      let root = `/skin/${hash}/`;
      if (debugViewOpen) {
        root += "debug/";
      }
      if (skin?.fileName != null) {
        root += `${skin.fileName}/`;
      }
      return root;
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

export const getRouteData = createSelector(
  getActiveContentPage,
  getSelectedSkinHash,
  getSearchQuery,
  getFileExplorerOpen,
  getFocusedSkinFile,
  getPermalinkUrlFromHashGetter,
  getSelectedSkinData,
  getDebugViewOpen,
  (
    activeContentPage,
    hash,
    query,
    fileExplorerOpen,
    focusedSkinFile,
    getPermalinkUrlFromHash,
    skinData,
    debugViewOpen
  ) => {
    if (activeContentPage === REVIEW_PAGE) {
      return { url: "/review/", title: "Review" };
    }
    if (activeContentPage === ABOUT_PAGE) {
      return { url: "/about/", title: "About" };
    }
    if (activeContentPage === UPLOAD_PAGE) {
      return { url: "/upload/", title: "Upload Skins" };
    }
    if (hash) {
      const skinUrl = getPermalinkUrlFromHash(hash);
      if (fileExplorerOpen && focusedSkinFile) {
        const url = `${skinUrl}files/${encodeURIComponent(
          focusedSkinFile.fileName
        )}`;
        return { url, title: skinData?.fileName };
      }
      return { url: skinUrl, title: skinData?.fileName };
    } else if (query) {
      return {
        url: `/?query=${encodeURIComponent(query)}`,
        title: `Search: ${query}`,
      };
    }
    return { url: "/", title: null };
  }
);

export const getUrl = createSelector(getRouteData, (routeData) => {
  return routeData.url;
});

export function getPageTitle(state) {
  const routeData = getRouteData(state);
  const pageTitle = routeData.title;
  const siteTitle = "Winamp Skin Museum";
  return [pageTitle, siteTitle].filter(Boolean).join(" - ");
}

export const getPreviewImageUrl = createSelector(
  getSelectedSkinHash,
  getSearchQuery,
  (hash, searchQuery) => {
    if (hash) {
      return `https://skin-museum-og-captbaritone-webamp.vercel.app/api/og?md5=${hash}`;
    } else if (searchQuery) {
      return `https://skin-museum-og-captbaritone-webamp.vercel.app/api/og?query=${encodeURIComponent(
        searchQuery
      )}`;
    }
    return null;
  }
);

export function getActiveContentPage(state) {
  return state.activeContentPage;
}

export function getSkins(state) {
  return state.skins;
}

export function getFileExplorerOpen(state) {
  // The UI for this is not done yet.
  // return state.fileExplorerOpen;
  return false;
}

export function getFocusedSkinFile(state) {
  return state.focusedSkinFile;
}

export function getAreReadyToCheckMissingUploads(state) {
  return Object.values(state.fileUploads).every(
    (file) => file.invalid || file.md5 != null
  );
}

// @deprecated
export function getUploadedFilesMd5s(state) {
  return Object.values(state.fileUploads).map((file) => file.md5);
}

export function getUploadedFiles(state) {
  const files = {};
  Object.values(state.fileUploads).forEach((file) => {
    if (file.status === "NEW") {
      files[file.md5] = file.file.name;
    }
  });
  return files;
}

export function getFeedbackFormOpen(state) {
  return state.showFeedbackForm;
}

export function getDebugViewOpen(state) {
  return state.debugViewOpen;
}
