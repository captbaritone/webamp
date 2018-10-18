import {
  ButterchurnOptions,
  InitialButterchurnDependencies
} from "../../types";

async function loadInitialDependencies(): Promise<
  InitialButterchurnDependencies
> {
  return new Promise(
    (
      resolve: (initialDependencies: InitialButterchurnDependencies) => void,
      reject
    ) => {
      // @ts-ignore Eventually we can replace these with async imports
      require.ensure(
        [
          "butterchurn",
          "butterchurn-presets/lib/butterchurnPresetsMinimal.min",
          "butterchurn-presets/lib/butterchurnPresetPackMeta.min"
        ],
        // @ts-ignore Eventually we can replace these with async imports
        require => {
          const butterchurn = require("butterchurn");
          const butterchurnMinimalPresets = require("butterchurn-presets/lib/butterchurnPresetsMinimal.min");
          const presetPackMeta = require("butterchurn-presets/lib/butterchurnPresetPackMeta.min");
          resolve({
            butterchurn,
            minimalPresets: butterchurnMinimalPresets.getPresets(),
            presetKeys: presetPackMeta.getMainPresetMeta().presets
          });
        },
        reject,
        "butterchurn"
      );
    }
  );
}

async function loadNonMinimalPresets() {
  return new Promise((resolve, reject) => {
    // @ts-ignore Eventually we can replace these with async imports
    require.ensure(
      ["butterchurn-presets/lib/butterchurnPresetsNonMinimal.min"],
      // @ts-ignore Eventually we can replace these with async imports
      require => {
        resolve(
          require("butterchurn-presets/lib/butterchurnPresetsNonMinimal.min").getPresets()
        );
      },
      reject,
      "butterchurn-presets"
    );
  });
}

const options: ButterchurnOptions = {
  loadInitialDependencies,
  loadNonMinimalPresets,
  presetConverterEndpoint:
    "https://p2tpeb5v8b.execute-api.us-east-2.amazonaws.com/default/milkdropShaderConverter"
};

if ("URLSearchParams" in window) {
  const params = new URLSearchParams(location.search);
  options.initialButterchurnPresetUrl = params.get("butterchurnPresetUrl");
  options.initialMilkdropPresetUrl = params.get("milkdropPresetUrl");
}

export default options;
