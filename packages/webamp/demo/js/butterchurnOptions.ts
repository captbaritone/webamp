import { ButterchurnOptions } from "./Webamp";

const KNOWN_PRESET_URLS_REGEXES = [
  /^https:\/\/unpkg\.com\/butterchurn-presets\/.*\.json$/,
  /^https:\/\/unpkg\.com\/butterchurn-presets-weekly\/.*\.json$/,
  /^https:\/\/archive\.org\/cors\/md_.*\.json$/,
  /^https:\/\/s3-us-east-2\.amazonaws\.com\/butterchurn-presets\/.*\.json$/,
];

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

async function loadButterchurnPresetMapURL(url: string) {
  const resp = await fetch(url);
  const namesToPresetUrls = await resp.json();
  return Object.keys(namesToPresetUrls).map((name: string) => {
    return { name, butterchurnPresetUrl: namesToPresetUrls[name] };
  });
}

export function getButterchurnOptions(
  startWithMilkdropHidden: boolean
): ButterchurnOptions {
  return {
    importButterchurn: () => {
      return import(
        /* webpackChunkName: "butterchurn" */
        // @ts-ignore
        "butterchurn"
      );
    },
    importConvertPreset: () => {
      return import(
        /* webpackChunkName: "milkdrop-preset-converter" */
        // @ts-ignore
        "milkdrop-preset-converter-aws"
      );
    },
    presetConverterEndpoint:
      "https://p2tpeb5v8b.execute-api.us-east-2.amazonaws.com/default/milkdropShaderConverter",
    getPresets: async () => {
      if ("URLSearchParams" in window) {
        const params = new URLSearchParams(location.search);
        const butterchurnPresetUrlParam = params.get("butterchurnPresetUrl");
        const butterchurnPresetMapUrlParam = params.get(
          "butterchurnPresetMapUrl"
        );
        const milkdropPresetUrl = params.get("milkdropPresetUrl");
        if (butterchurnPresetMapUrlParam) {
          if (
            !KNOWN_PRESET_URLS_REGEXES.some((pattern) =>
              pattern.test(butterchurnPresetMapUrlParam)
            )
          ) {
            console.error(
              "Unsupported URL passed as butterchurnPresetMapUrl query param."
            );
          } else {
            return loadButterchurnPresetMapURL(butterchurnPresetMapUrlParam);
          }
        } else if (butterchurnPresetUrlParam) {
          if (
            !KNOWN_PRESET_URLS_REGEXES.some((pattern) =>
              pattern.test(butterchurnPresetUrlParam)
            )
          ) {
            console.error(
              "Unsupported URL passed as butterchurnPresetUrl query param."
            );
          } else {
            return [
              {
                name: presetNameFromURL(butterchurnPresetUrlParam),
                butterchurnPresetUrl: butterchurnPresetUrlParam,
              },
            ];
          }
        } else if (milkdropPresetUrl) {
          throw new Error("We still need to implement this");
        }
      }

      const presets = await import(
        /* webpackChunkName: "butterchurn-presets" */
        // @ts-ignore
        "butterchurn-presets"
      );
      return Object.entries(presets.default).map(([name, preset]) => {
        return { name, butterchurnPresetObject: preset as Object };
      });
    },
    butterchurnOpen: !startWithMilkdropHidden,
  };
}
