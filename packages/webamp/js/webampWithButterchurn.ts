import { Options } from "./types";
import { PrivateOptions } from "./webampLazy";
import Webamp from "./webamp";
// @ts-ignore
import butterchurn from "butterchurn/dist/butterchurn.min.js"; // buterchurn@3.0.0-beta.4
// @ts-ignore
import butterchurnPresets from "butterchurn-presets/dist/base.js"; // butterchurn-presets@3.0.0-beta.4

const DEFAULT_BUTTERCHURN_WINDOW_LAYOUT = {
  main: { position: { left: 0, top: 0 } },
  equalizer: { position: { left: 0, top: 116 } },
  playlist: {
    position: { left: 0, top: 232 },
    size: { extraHeight: 4, extraWidth: 0 },
  },
  milkdrop: {
    position: { left: 275, top: 0 },
    size: { extraHeight: 12, extraWidth: 7 },
  },
};

const DEFAULT_REQUIRE_BUTTERCHURN_PRESETS = async () =>
  Object.entries(butterchurnPresets).map(([name, preset]) => {
    return { name, butterchurnPresetObject: preset as Object };
  });

export default class WebampWithButterchurn extends Webamp {
  constructor(options: Options & PrivateOptions) {
    const requireButterchurnPresets =
      options.requireButterchurnPresets ?? DEFAULT_REQUIRE_BUTTERCHURN_PRESETS;
    super({
      ...options,
      requireButterchurnPresets,
      __butterchurnOptions: {
        importButterchurn: () => Promise.resolve(butterchurn),
        // This should be considered deprecated, and users should instead supply
        // the top level `requireButterchurnPresets` option.
        getPresets: requireButterchurnPresets,
        butterchurnOpen: true,
      },
      windowLayout: options.windowLayout ?? DEFAULT_BUTTERCHURN_WINDOW_LAYOUT,
    });
  }
}

// Bit of a hack here. This overwrites the value set in Webamp.ts and WebampLazy.ts
// @ts-ignore
window.Webamp = Webamp;
