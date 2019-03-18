import JSZip from "jszip";
import * as musicMetadataBrowser from "music-metadata-browser";
import WebampLazy, { Options } from "./webampLazy";

class Winamp extends WebampLazy {
  constructor(options: Options) {
    super({
      ...options,
      requireJSZip: () => Promise.resolve(JSZip),
      requireMusicMetadata: () => Promise.resolve(musicMetadataBrowser)
    });
  }
}

export default Winamp;
