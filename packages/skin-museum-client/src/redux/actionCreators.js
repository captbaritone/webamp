import { ABOUT_PAGE, UPLOAD_PAGE, REVIEW_PAGE } from "../constants";
export function closeModal() {
  return { type: "CLOSE_MODAL" };
}

export function closeFeedbackForm() {
  return { type: "CLOSE_FEEDBACK_FORM" };
}

export function showFeedbackForm() {
  return { type: "SHOW_FEEDBACK_FORM" };
}

export function searchQueryChanged(query) {
  return { type: "SEARCH_QUERY_CHANGED", query };
}

export function requestUnloadedSkin(index) {
  return { type: "REQUEST_UNLOADED_SKIN", index };
}

export function selectedSkin(hash, position) {
  return { type: "SELECTED_SKIN", hash, position };
}

export function requestedRandomSkin() {
  return { type: "REQUESTED_RANDOM_SKIN" };
}

export function markNsfw(hash) {
  return { type: "MARK_NSFW", hash };
}

export function gotNewMatchingSkins(skins) {
  return { type: "GOT_NEW_MATCHING_SKINS", skins };
}

export function gotSkinData(hash, data) {
  return { type: "GOT_SKIN_DATA", hash, data };
}

export function loadedSkinZip(zip) {
  return { type: "LOADED_SKIN_ZIP", zip };
}

export function consentsToNsfw() {
  return { type: "CONCENTS_TO_NSFW" };
}

export function doesNotConcentToNsfw() {
  return { type: "DOES_NOT_CONCENT_TO_NSFW" };
}

export function setDragging(dragging) {
  return { type: "SET_DRAGGING", dragging };
}

export function toggleDebugView() {
  return { type: "TOGGLE_DEBUG_VIEW" };
}

export function toggleUploadView() {
  return { type: "TOGGLE_UPLOAD_VIEW" };
}

export function closeUploadFiles() {
  return { type: "CLOSE_UPLOAD_FILES" };
}

export function gotFiles(files) {
  return { type: "GOT_FILES", files };
}

export function gotFile(file, id) {
  return { type: "GOT_FILE", file, id };
}

export function invalidFileExtension(id) {
  return { type: "INVALID_FILE_EXTENSION", id };
}

export function invalidArchive(id) {
  return { type: "INVALID_ARCHIVE", id };
}

export function gotSkinType(id, skinType) {
  return { type: "GOT_SKIN_TYPE", id, skinType };
}

export function gotFileMd5(id, md5) {
  return { type: "GOT_FILE_MD5", id, md5 };
}

export function tryToUploadFile(id) {
  return { type: "TRY_TO_UPLOAD_FILE", id };
}

export function startingFileUpload(id) {
  return { type: "STARTING_FILE_UPLOAD", id };
}

export function tryToUploadAllFiles() {
  return { type: "TRY_TO_UPLOAD_ALL_FILES" };
}

export function uploadFailed(id) {
  return { type: "UPLOAD_FAILED", id };
}

export function uploadDelayed(id) {
  return { type: "UPLOAD_DELAYED", id };
}

export function uploadedSkin(id, response) {
  return { type: "UPLOADED_SKIN", id, response };
}

export function archivedSkin(id) {
  return { type: "ARCHIVED_SKIN", id };
}

export function gotMissingAndFoundMd5s({ missing, found }) {
  return { type: "GOT_MISSING_AND_FOUND_MD5S", missing, found };
}

export function checkIfUploadsAreMissing() {
  return { type: "CHECK_IF_UPLOADS_ARE_MISSING" };
}

export function selectSkinFile(fileName) {
  const ext = fileName.split(".").pop().toLowerCase();

  return { type: "SELECTED_SKIN_FILE_TO_FOCUS", fileName, ext };
}

export function gotFocusedSkinFile(content) {
  return { type: "GOT_FOCUSED_SKIN_FILE", content };
}

export function requestedAboutPage() {
  return { type: "REQUESTED_PAGE", page: ABOUT_PAGE };
}

export function requestedReviewPage() {
  return { type: "REQUESTED_PAGE", page: REVIEW_PAGE };
}

export function requestedUploadPage() {
  return { type: "REQUESTED_PAGE", page: UPLOAD_PAGE };
}

export function selectRelativeSkin(offset) {
  return { type: "SELECT_RELATIVE_SKIN", offset };
}

export function openFileExplorer() {
  return { type: "OPEN_FILE_EXPLORER" };
}

export function toggleFileExplorer() {
  return { type: "TOGGLE_FILE_EXPLORER" };
}

export function closeFileExlporer() {
  return { type: "CLOSE_FILE_EXPLORER" };
}

export function alert(message) {
  return { type: "ALERT", message };
}
