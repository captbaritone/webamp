import { ButterchurnOptions } from "../../js/types";

function presetNameFromURL(url: string) {
  try {
    const urlParts = url.split("/");
    const lastPart = urlParts[urlParts.length - 1];
    const presetName = lastPart.substring(0, lastPart.length - 5); // remove .milk or .json
    return decodeURIComponent(presetName);
  } catch (e) {
    // if something goes wrong parsing url, just use url as the preset name
    console.error(e);
    return url;
  }
}

export function getButterchurnOptions(
  startWithMilkdropHidden: boolean
): ButterchurnOptions {
  return {
    importButterchurn: () => {
      return import(/* webpackChunkName: "butterchurn-initial-dependencies" */
      // @ts-ignore
      "butterchurn");
    },
    importConvertPreset: () => {
      return import(/* webpackChunkName: "milkdrop-preset-converter" */
      // @ts-ignore
      "milkdrop-preset-converter-aws");
    },
    presetConverterEndpoint:
      "https://p2tpeb5v8b.execute-api.us-east-2.amazonaws.com/default/milkdropShaderConverter",
    getPresets: async () => {
      if ("URLSearchParams" in window) {
        const params = new URLSearchParams(location.search);
        const butterchurnPresetUrlParam = params.get("butterchurnPresetUrl");
        const milkdropPresetUrl = params.get("milkdropPresetUrl");
        if (butterchurnPresetUrlParam) {
          return [
            {
              name: presetNameFromURL(butterchurnPresetUrlParam),
              butterchurnPresetUrl: butterchurnPresetUrlParam
            }
          ];
        } else if (milkdropPresetUrl) {
          throw new Error("We still need to implement this");
        }
      }
      const resp = await fetch(
        "https://unpkg.com/butterchurn-presets-weekly@0.0.2/weeks/week1/presets.json"
      );
      // TODO: Fallback to some other presets?
      const namesToPresetUrls = await resp.json();
      return Object.keys(namesToPresetUrls).map((name: string) => {
        return { name, butterchurnPresetUrl: namesToPresetUrls[name] };
      });
    },
    butterchurnOpen: !startWithMilkdropHidden
  };
}
