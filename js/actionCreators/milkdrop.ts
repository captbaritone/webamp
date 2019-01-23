import { INITIALIZE_PRESETS, GOT_BUTTERCHURN } from "../actionTypes";
import { Dispatchable } from "../types";
import Presets from "../components/MilkdropWindow/Presets";

export function initializePresets(presetOptions: any): Dispatchable {
  return async dispatch => {
    const { loadInitialDependencies, loadNonMinimalPresets } = presetOptions;
    const {
      butterchurn,
      presetKeys,
      minimalPresets
    } = await loadInitialDependencies();

    const presetDefinitions = presetKeys.map((key: string) => {
      if (minimalPresets[key] != null) {
        return {
          type: "BUTTERCHURN_JSON",
          name: key,
          definition: minimalPresets[key]
        };
      }
      return async () => {
        // TODO: Avoid a race where we try to resolve this promise more than once in parallel.
        const nonMinimalPresets = await loadNonMinimalPresets();
        return {
          type: "BUTTERCHURN_JSON",
          name: key,
          definition: nonMinimalPresets[key]
        };
      };
    });

    dispatch({
      type: "GOT_BUTTERCHUN_PRESET",
      json: minimalPresets[presetKeys[1]]
    });

    setTimeout(() => {
      console.log(minimalPresets[presetKeys[0]]);
      dispatch({
        type: "GOT_BUTTERCHUN_PRESET",
        json: minimalPresets[presetKeys[0]]
      });
    }, 8000);

    dispatch({ type: GOT_BUTTERCHURN, butterchurn });
    // dispatch({ type: INITIALIZE_PRESETS, presets });
  };
}

function _presetNameFromURL(url: string): string {
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

async function _fetchPreset(
  presetUrl: string,
  { isButterchurn }: { isButterchurn: boolean }
) {
  const response = await fetch(presetUrl);
  if (!response.ok) {
    console.error(response.statusText);
    alert(`Unable to load MilkDrop preset from ${presetUrl}`);
    return null;
  }
  const presetName = _presetNameFromURL(presetUrl);

  let preset = null;
  if (isButterchurn) {
    try {
      preset = await response.json();
    } catch (e) {
      console.error(e);
      alert(`Failed to parse MilkDrop preset from ${presetUrl}`);
      return null;
    }
  } else {
    preset = { file: await response.blob() };
  }

  return { [presetName]: preset };
}
