import JSZip from "jszip";
import * as musicMetadata from "music-metadata";
import { IMetadataApi, Options } from "./types";
import WebampLazy, { PrivateOptions } from "./webampLazy";

// There is some bug between how JSZip pulls in setimmediate (which it expects
// to polyfill `window.setimmediate` and our bundler set. The result is that one
// of our bundles is missing the polyfill. If we call JSZip code from within
// that bundle the polyfill is not present and we get an error.
//
// To work around this we manually import the helper function which is the one
// place JSZip actually uses `setImmediate` and then set it to use our fork of
// the polyfill which does not require adding a property to `window`.
import { setImmediate } from "./setImmediate";
// @ts-ignore
import Utils from "jszip/lib/utils";
// @ts-ignore
Utils.delay = function (callback, args, self) {
  setImmediate(() => {
    callback.apply(self || null, args || []);
  });
};

export type * from "./types";

export default class Webamp extends WebampLazy {
  constructor(options: Options & PrivateOptions) {
    super({
      ...options,
      requireJSZip: async () => JSZip,
      requireMusicMetadata: async (): Promise<IMetadataApi> => {
        // @ts-ignore
        return musicMetadata;
      },
    });
  }
}

// Bit of a hack here. This overwrites the value set in WebampLazy.ts
// @ts-ignore
window.Webamp = Webamp;
