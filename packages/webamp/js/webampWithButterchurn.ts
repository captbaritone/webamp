import { Options } from "./types";
import { PrivateOptions } from "./webampLazy";
import Webamp from "./webamp";
import "butterchurn/dist/butterchurn.min.js"; // buterchurn@3.0.0-beta.4
import "butterchurn-presets/dist/base.js"; // butterchurn-presets@3.0.0-beta.4

// @ts-ignore
const butterchurn = window.butterchurn;
// @ts-ignore
const butterchurnPresets = window.base.default;

export default class WebampWithButterchurn extends Webamp {
  constructor(options: Options & PrivateOptions) {
    super({
      ...options,
      __butterchurnOptions: {
        importButterchurn: () => Promise.resolve(butterchurn),
        // @ts-ignore
        getPresets: () => {
          return Object.entries(butterchurnPresets).map(([name, preset]) => {
            return { name, butterchurnPresetObject: preset };
          });
        },
      },
    });
  }
}

// Bit of a hack here. This overwrites the value set in Webamp.ts and WebampLazy.ts
// @ts-ignore
window.Webamp = Webamp;
