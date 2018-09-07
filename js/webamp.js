import JSZip from "jszip";
import mm from "music-metadata-browser";
import WebampLazy from "./webampLazy";

class Winamp extends WebampLazy {
  constructor(options) {
    super({
      ...options,
      requireJSZip: () => JSZip,
      requireMusicMetadata: () => mm
    });
  }
}

export default Winamp;
