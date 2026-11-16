import { ButterchurnOptions } from "../../webamp/js/types";

const KNOWN_PRESET_URLS_REGEXES = [
  /^https:\/\/unpkg\.com\/butterchurn-presets\/.*\.json$/,
  /^https:\/\/unpkg\.com\/butterchurn-presets-weekly\/.*\.json$/,
  /^https:\/\/archive\.org\/cors\/md_.*\.json$/,
  /^https:\/\/s3-us-east-2\.amazonaws\.com\/butterchurn-presets\/.*\.json$/,
];

const KNOWN_MILK_URLS_REGEXES = [/^https:\/\/archive\.org\/cors\/md_.*\.milk$/];

const PRESET_CONVERTER_ENDPOINT =
  "https://p2tpeb5v8b.execute-api.us-east-2.amazonaws.com/default/milkdropShaderConverter";

function importConvertPreset() {
  return import(
    /* webpackChunkName: "milkdrop-preset-converter" */
    // @ts-ignore
    "milkdrop-preset-converter-aws"
  );
}

async function loadMilkdropPresetURL(url: string): Promise<Object> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch Milkdrop preset: ${resp.status}`);
  }
  const [milk, { convertPreset }] = await Promise.all([
    resp.text(),
    importConvertPreset(),
  ]);
  return convertPreset(milk, PRESET_CONVERTER_ENDPOINT);
}

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
    importConvertPreset,
    presetConverterEndpoint: PRESET_CONVERTER_ENDPOINT,
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
          if (
            !KNOWN_MILK_URLS_REGEXES.some((pattern) =>
              pattern.test(milkdropPresetUrl)
            )
          ) {
            console.error(
              "Unsupported URL passed as milkdropPresetUrl query param."
            );
          } else {
            return [
              {
                name: presetNameFromURL(milkdropPresetUrl),
                getButterchrunPresetObject: () =>
                  loadMilkdropPresetURL(milkdropPresetUrl),
              },
            ];
          }
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
