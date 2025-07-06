import { Action, Skin } from "../types";

export interface SettingsState {
  availableSkins: Array<Skin>;
}

const defaultSettingsState = {
  availableSkins: [],
};

const settings = (
  state: SettingsState = defaultSettingsState,
  action: Action
): SettingsState => {
  switch (action.type) {
    case "SET_AVAILABLE_SKINS":
      return { ...state, availableSkins: (action as any).skins };
    default:
      return state;
  }
};

export default settings;
