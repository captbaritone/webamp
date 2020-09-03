import { SKIN_CDN, SCREENSHOT_CDN } from "./constants";
export function screenshotUrlFromHash(hash) {
  return `${SCREENSHOT_CDN}/screenshots/${hash}.png`;
}

export function skinUrlFromHash(hash) {
  return `${SKIN_CDN}/skins/${hash}.wsz`;
}

export function getWindowSize() {
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName("body")[0],
    x = e.clientWidth || g.clientWidth || w.innerWidth,
    y = e.clientHeight || g.clientHeight || w.innerHeight;

  return {
    windowWidth: x,
    windowHeight: y,
  };
}

export function eventIsLinkClick(event) {
  return (
    !event.defaultPrevented && // onClick prevented default
    event.button === 0 &&
    !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
  );
}

export function clamp(min, max, value) {
  return Math.min(max, Math.max(min, value));
}
