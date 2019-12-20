import JSZip from "jszip";
import * as musicMetadataBrowser from "music-metadata-browser";
import WebampLazy from "./webampLazy";

export default class Webamp extends WebampLazy {
  constructor(options) {
    super({
      ...options,
      requireJSZip: () => JSZip,
      requireMusicMetadata: () => musicMetadataBrowser,
    });
  }
}
