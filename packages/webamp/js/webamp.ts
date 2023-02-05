import JSZip from "jszip";
import * as musicMetadataBrowser from "music-metadata-browser";
import WebampLazy, { PrivateOptions, Options } from "./webampLazy";

export default class Webamp extends WebampLazy {
  constructor(options: Options & PrivateOptions) {
    super({
      ...options,
      requireJSZip: async () => JSZip,
      requireMusicMetadata: async () => musicMetadataBrowser,
    });
  }
}
