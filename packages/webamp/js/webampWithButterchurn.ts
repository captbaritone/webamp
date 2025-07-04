import { Options } from "./types";
import { PrivateOptions } from "./webampLazy";
import Webamp from "./webamp";
// @ts-ignore
import butterchurn from "butterchurn/dist/butterchurn.min.js"; // buterchurn@3.0.0-beta.4
// @ts-ignore
import butterchurnPresets from "butterchurn-presets/dist/base.js"; // butterchurn-presets@3.0.0-beta.4

console.log("Using butterchurn", butterchurn);
console.log("Using butterchurn presets", butterchurnPresets);

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
