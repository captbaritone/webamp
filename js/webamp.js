import JSZip from "jszip";
import musicMetadata from "music-metadata-browser";
import WebampLazy from "./webampLazy";

class Winamp extends WebampLazy {
  constructor(options) {
    super({
      ...options,
      requireJSZip: () => JSZip,
      requireMusicMetadata: () => musicMetadata
    });
  }
}

export default Winamp;
