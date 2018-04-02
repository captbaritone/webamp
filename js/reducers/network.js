import { NETWORK_CONNECTED, NETWORK_DISCONNECTED } from "../actionTypes";

const network = (state = { connected: true }, action) => {
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
