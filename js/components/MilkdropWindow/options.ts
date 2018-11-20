import {
  ButterchurnOptions,
  InitialButterchurnDependencies
} from "../../types";

async function loadInitialDependencies(): Promise<
  InitialButterchurnDependencies
> {
  const [butterchurn, butterchurnMinimalPresets, presetPackMeta] =
    // prettier-ignore
    await Promise.all([
      import(
        /* webpackChunkName: "butterchurn-initial-dependencies" */
        // @ts-ignore
        "butterchurn"
      ),
      import(
        /* webpackChunkName: "butterchurn-initial-dependencies" */
        // @ts-ignore
        "butterchurn-presets/lib/butterchurnPresetsMinimal.min"
      ),
      import(
        /* webpackChunkName: "butterchurn-initial-dependencies" */
        // @ts-ignore
        "butterchurn-presets/lib/butterchurnPresetPackMeta.min"
      )
  ]);
  return {
    butterchurn: butterchurn.default,
    minimalPresets: butterchurnMinimalPresets.default.getPresets(),
    presetKeys: presetPackMeta.default.getMainPresetMeta().presets
  };
}

async function loadNonMinimalPresets() {
  return (await import(/* webpackChunkName: "butterchurn-non-minimal-presets" */
  // @ts-ignore
  "butterchurn-presets/lib/butterchurnPresetsNonMinimal.min")).getPresets();
}

async function loadConvertPreset() {
  const { convertPreset } =
    // prettier-ignore
    await import(
    /* webpackChunkName: "milkdrop-preset-converter" */
    // @ts-ignore
    "milkdrop-preset-converter-aws"
  );
  return convertPreset;
}

const options: ButterchurnOptions = {
  loadConvertPreset,
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
