import { Action } from "../types";
import { NETWORK_CONNECTED, NETWORK_DISCONNECTED } from "../actionTypes";

export interface NetworkState {
  connected: boolean;
}

const network = (
  state: NetworkState = { connected: true },
  action: Action
): NetworkState => {
  switch (action.type) {
    case NETWORK_CONNECTED:
      return { ...state, connected: true };
    case NETWORK_DISCONNECTED:
      return { ...state, connected: false };
    default:
      return state;
  }
};

export default network;
