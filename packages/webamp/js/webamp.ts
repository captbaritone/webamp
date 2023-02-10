import JSZip from "jszip";
import * as musicMetadataBrowser from "music-metadata-browser";
import { Options } from "./types";
import WebampLazy, { PrivateOptions } from "./webampLazy";

export default class Webamp extends WebampLazy {
  constructor(options: Options & PrivateOptions) {
    super({
      ...options,
      requireJSZip: async () => JSZip,
      requireMusicMetadata: async () => musicMetadataBrowser,
    });
  }
}

console.log("Webamp loaded");

console.log(Webamp);

// Bit of a hack here. This overwrites the value set in WebampLazy.ts
// @ts-ignore
window.Webamp = Webamp;

// @ts-ignore
console.log("window.Webamp set", window.Webamp);
