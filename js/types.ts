type Skin = {
url: string, name: string
}

export type Action = {
    type: "NETWORK_CONNECTED"
} | {
    type: "NETWORK_DISCONNECTED"
} | {
    type: "SET_AVAILABLE_SKINS"
    skins: Array<Skin>
}


export interface SettingsState {
    availableSkins: Array<Skin>;
  }


export interface NetworkState {
    connected: boolean;
  }