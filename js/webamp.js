import JSZip from "jszip";
import * as musicMetadataBrowser from "music-metadata-browser";
import WebampLazy from "./webampLazy";

class Winamp extends WebampLazy {
  constructor(options) {
    super({
      ...options,
      requireJSZip: () => JSZip,
      requireMusicMetadata: () => musicMetadataBrowser,
    });
  }
}

export default Winamp;
