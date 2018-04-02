import { SET_AVAILABLE_SKINS } from "../actionTypes";

const defaultSettingsState = {
  availableSkins: []
};

const settings = (state = defaultSettingsState, action) => {
  switch (action.type) {
    case SET_AVAILABLE_SKINS:
      return { ...state, availableSkins: action.skins };
    default:
      return state;
  }
};

export default settings;
