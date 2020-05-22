import JSZip from "jszip";
import * as musicMetadataBrowser from "music-metadata-browser";
import WebampLazy, { Options as LazyOptions } from "./webampLazy";

export type Options = Omit<
  LazyOptions,
  "requireJSZip" | "requireMusicMetadata"
>;

export default class Webamp extends WebampLazy {
  constructor(options: Options) {
    super({
      ...options,
      requireJSZip: async () => JSZip,
      requireMusicMetadata: async () => musicMetadataBrowser,
    });
  }
}
