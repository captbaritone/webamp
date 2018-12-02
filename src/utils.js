import skins from "./skins.json";

export function screenshotUrlFromHash(hash) {
  return `https://s3.amazonaws.com/webamp-uploaded-skins/screenshots/${hash}.png`;
}

export function filenameFromHash(hash) {
  return skins[hash].fileName;
}

export function skinUrlFromHash(hash) {
  return `https://s3.amazonaws.com/webamp-uploaded-skins/skins/${hash}.wsz`;
}

export function getPermalinkUrlFromHash(hash) {
  return `/skin/${hash}/${filenameFromHash(hash)}`;
}

export function getWindowSize() {
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName("body")[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;

  return {
    windowWidth: x,
    windowHeight: y
  };
}

export function eventIsLinkClick(event) {
  return (
    !event.defaultPrevented && // onClick prevented default
    event.button === 0 &&
    !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
  );
}
