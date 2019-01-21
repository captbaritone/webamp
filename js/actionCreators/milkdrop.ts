import { INITIALIZE_PRESETS, GOT_BUTTERCHURN } from "../actionTypes";
import { Dispatchable } from "../types";
import Presets from "../components/MilkdropWindow/Presets";

export function initializePresets(presetOptions: any): Dispatchable {
  return async dispatch => {
    const [
      { butterchurn, presetKeys, minimalPresets },
      initialPreset
    ] = await Promise.all([
      presetOptions.loadInitialDependencies(),
      _loadInitialPreset(presetOptions)
    ]);

    const presets = new Presets({
      keys: presetKeys,
      initialPresets: minimalPresets,
      getRest: presetOptions.loadNonMinimalPresets,
      presetConverterEndpoint: presetOptions.presetConverterEndpoint,
      loadConvertPreset: presetOptions.loadConvertPreset
    });

    if (initialPreset) {
      const presetIndices = presets.addPresets(initialPreset);
      const presetIndex = presetIndices[0];
      await presets.selectIndex(presetIndex);
    }

    dispatch({ type: GOT_BUTTERCHURN, butterchurn });
    dispatch({ type: INITIALIZE_PRESETS, presets });
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

async function _loadInitialPreset({
  initialButterchurnPresetUrl,
  initialMilkdropPresetUrl
}: {
  initialButterchurnPresetUrl: string;
  initialMilkdropPresetUrl: string;
}) {
  if (initialButterchurnPresetUrl && initialMilkdropPresetUrl) {
    alert(
      "Unable to handle both milkdropPresetUrl and butterchurnPresetUrl. Please specify one or the other."
    );
  } else if (initialButterchurnPresetUrl) {
    return _fetchPreset(initialButterchurnPresetUrl, { isButterchurn: true });
  } else if (initialMilkdropPresetUrl) {
    return _fetchPreset(initialMilkdropPresetUrl, { isButterchurn: false });
  }
  return null;
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
