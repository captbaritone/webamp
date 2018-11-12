import {
  ButterchurnOptions,
  InitialButterchurnDependencies
} from "../../types";

async function loadInitialDependencies(): Promise<
  InitialButterchurnDependencies
> {
  const [butterchurn, butterchurnMinimalPresets] =
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
      )
  ]);
  return {
    butterchurn,
    minimalPresets: butterchurnMinimalPresets.getPresets()
  };
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
  presetConverterEndpoint:
    "https://p2tpeb5v8b.execute-api.us-east-2.amazonaws.com/default/milkdropShaderConverter"
};

if ("URLSearchParams" in window) {
  const params = new URLSearchParams(location.search);
  options.initialButterchurnPresetUrl = params.get("butterchurnPresetUrl");
  options.initialMilkdropPresetUrl = params.get("milkdropPresetUrl");
}

export default options;
