export function closeModal() {
  return { type: "CLOSE_MODAL" };
}

export function searchQueryChanged(query) {
  return { type: "SEARCH_QUERY_CHANGED", query };
}

export function selectedSkin(hash, position) {
  return { type: "SELECTED_SKIN", hash, position };
}

export function requestedRandomSkin() {
  return { type: "REQUESTED_RANDOM_SKIN" };
}

export function gotNewMatchingHashes(matchingHashes) {
  return { type: "GOT_NEW_MATCHING_HASHES", matchingHashes };
}

export function loadedSkinZip(zip) {
  return { type: "LOADED_SKIN_ZIP", zip };
}
