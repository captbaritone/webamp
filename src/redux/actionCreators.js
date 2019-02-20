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

export function selectSkinFile(fileName) {
  const ext = fileName
    .split(".")
    .pop()
    .toLowerCase();

  return { type: "SELECTED_SKIN_FILE_TO_FOCUS", fileName, ext };
}

export function gotFocusedSkinFile(content) {
  return { type: "GOT_FOCUSED_SKIN_FILE", content };
}

export function requestedAboutPage() {
  return { type: "REQUESTED_ABOUT_PAGE" };
}

export function selectRelativeSkin(offset) {
  return { type: "SELECT_RELATIVE_SKIN", offset };
}

export function openFileExplorer() {
  return { type: "OPEN_FILE_EXPLORER" };
}

export function closeFileExlporer() {
  return { type: "CLOSE_FILE_EXPLORER" };
}
