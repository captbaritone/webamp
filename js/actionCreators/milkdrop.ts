import {
  GOT_BUTTERCHURN_PRESETS,
  GOT_BUTTERCHURN,
  SELECT_PRESET_AT_INDEX,
  RESOLVE_PRESET_AT_INDEX,
  TOGGLE_PRESET_OVERLAY
} from "../actionTypes";
import * as Selectors from "../selectors";
import {
  Dispatchable,
  TransitionType,
  Preset,
  LazyButterchurnPresetJson
} from "../types";
import * as FileUtils from "../fileUtils";

export function initializePresets(presetOptions: any): Dispatchable {
  return async dispatch => {
    const { loadInitialDependencies, loadNonMinimalPresets } = presetOptions;
    const {
      butterchurn,
      presetKeys,
      minimalPresets
    } = await loadInitialDependencies();
    dispatch({ type: GOT_BUTTERCHURN, butterchurn });

    const presets: Preset[] = presetKeys.map((key: string) => {
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

    dispatch(loadPresets(presets));
  };
}

export function loadPresets(presets: Preset[]): Dispatchable {
  return (dispatch, getState) => {
    const presetLength = getState().milkdrop.presets.length;
    dispatch({ type: GOT_BUTTERCHURN_PRESETS, presets });
    dispatch(requestPresetAtIndex(presetLength, TransitionType.IMMEDIATE));
  };
}

export function appendPresetFileList(fileList: FileList): Dispatchable {
  return async dispatch => {
    const presets: Preset[] = Array.from(fileList).map(file => {
      const JSON_EXT = ".json";
      const MILK_EXT = ".milk";
      const filename = file.name.toLowerCase();
      if (filename.endsWith(MILK_EXT)) {
        // Not sure why we need this type definition.
        const lazy: LazyButterchurnPresetJson = {
          type: "LAZY_BUTTERCHURN_JSON",
          name: file.name.slice(0, file.name.length - MILK_EXT.length),
          getDefinition: async () => {
            // TODO: Post this blob to the url end point and get the json back
            return {};
          }
        };
        throw new Error(".milk preset support not yet implemented");
        return lazy;
      } else if (filename.endsWith(JSON_EXT)) {
        // Not sure why we need this type definition.
        const lazy: LazyButterchurnPresetJson = {
          type: "LAZY_BUTTERCHURN_JSON",
          name: file.name.slice(0, file.name.length - JSON_EXT.length),
          getDefinition: async () => {
            const str = await FileUtils.genStringFromFileReference(file);
            // TODO: How should we handle the case where json parsing fails?
            return JSON.parse(str);
          }
        };
        return lazy;
      } else {
        throw new Error("Invalid type");
      }
    });
    dispatch(loadPresets(presets));
    // TODO: Select the first of these presets
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
        // Perhaps we could hold a reference to the preset at the index before
        // we await and confirm that it hasn't changed after the await?
        dispatch({ type: RESOLVE_PRESET_AT_INDEX, index, json });
        dispatch({ type: SELECT_PRESET_AT_INDEX, index, transitionType });
        return;
    }
  };
}

export function handlePresetDrop(e: React.DragEvent): Dispatchable {
  // TODO: Ensure we actually select the new preset.
  return appendPresetFileList(e.dataTransfer.files);
}

export function togglePresetOverlay(): Dispatchable {
  return { type: TOGGLE_PRESET_OVERLAY };
}
