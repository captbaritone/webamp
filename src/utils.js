export function screenshotUrlFromHash(hash) {
  return `https://s3.amazonaws.com/webamp-uploaded-skins/screenshots/${hash}.png`;
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
