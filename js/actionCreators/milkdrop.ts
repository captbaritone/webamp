import {
  GOT_BUTTERCHURN_PRESETS,
  GOT_BUTTERCHURN,
  SELECT_PRESET_AT_INDEX,
  RESOLVE_PRESET_AT_INDEX,
  TOGGLE_PRESET_OVERLAY
} from "../actionTypes";
import * as Selectors from "../selectors";
import { Dispatchable, TransitionType } from "../types";

export function initializePresets(presetOptions: any): Dispatchable {
  return async dispatch => {
    const { loadInitialDependencies, loadNonMinimalPresets } = presetOptions;
    const {
      butterchurn,
      presetKeys,
      minimalPresets
    } = await loadInitialDependencies();
    dispatch({ type: GOT_BUTTERCHURN, butterchurn });

    const presets = presetKeys.map((key: string) => {
      if (minimalPresets[key] != null) {
        return {
          type: "BUTTERCHURN_JSON",
          name: key,
          definition: minimalPresets[key]
        };
      }
      return {
        type: "LAZY_BUTTERCHURN_JSON",
        name: key,
        getDefinition: async () => {
          // TODO: Avoid a race where we try to resolve this promise more than once in parallel.
          const nonMinimalPresets = await loadNonMinimalPresets();
          return nonMinimalPresets[key];
        }
      };
    });

    dispatch({ type: GOT_BUTTERCHURN_PRESETS, presets });
    dispatch(requestPresetAtIndex(0, TransitionType.IMMEDIATE));
  };
}

export function appendPresetFileList(presets: FileList[]): Dispatchable {
  return async dispatch => {
    dispatch({ type: GOT_BUTTERCHURN_PRESETS, presets });
  };
}

export function selectNextPreset(): Dispatchable {
  return (dispatch, getState) => {
    const state = getState();
    const currentPresetIndex = Selectors.getCurrentPresetIndex(state);
    if (currentPresetIndex == null) {
      return;
    }
    const nextPresetIndex = currentPresetIndex + 1;
    dispatch(requestPresetAtIndex(nextPresetIndex, TransitionType.DEFAULT));
  };
}

export function selectRandomPreset(): Dispatchable {
  return (dispatch, getState) => {
    const state = getState();
    const randomIndex = Math.floor(
      Math.random() * state.milkdrop.presets.length
    );
    dispatch(requestPresetAtIndex(randomIndex, TransitionType.DEFAULT));
  };
}

export function requestPresetAtIndex(
  index: number,
  transitionType: TransitionType
): Dispatchable {
  return async (dispatch, getState) => {
    const state = getState();
    const preset = state.milkdrop.presets[index];
    if (preset == null) {
      // Index might be out of range.
      return;
    }
    switch (preset.type) {
      case "BUTTERCHURN_JSON":
        dispatch({ type: SELECT_PRESET_AT_INDEX, index, transitionType });
        return;
      case "LAZY_BUTTERCHURN_JSON":
        const json = await preset.getDefinition();
        // What if the index has changed?
        dispatch({ type: RESOLVE_PRESET_AT_INDEX, index, json });
        dispatch({ type: SELECT_PRESET_AT_INDEX, index, transitionType });
        return;
    }
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

export function togglePresetOverlay(): Dispatchable {
  return { type: TOGGLE_PRESET_OVERLAY };
}
