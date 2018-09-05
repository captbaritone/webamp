type Skin = {
  url: string;
  name: string;
};

export type Action =
  | {
      type: "NETWORK_CONNECTED";
    }
  | {
      type: "NETWORK_DISCONNECTED";
    }
  | {
      type: "SET_AVAILABLE_SKINS";
      skins: Array<Skin>;
  }
  | {
      type: "PLAY";
  }
  | {
      type: "IS_PLAYING";
  }
  | {
      type: "PAUSE";
  }
  | {
      type: "STOP";
  }
  | {
      type: "IS_STOPPED";
  }
  | {
      type: "CHANNEL_COUNT_CHANGED";
      channels: number;
  } | {
      type: "TOGGLE_TIME_MODE";
  } | {
      type: "UPDATE_TIME_ELAPSED";
      elapsed: number;
  } | {
      type: "ADD_TRACK_FROM_URL";
  } | {
      type: "SET_MEDIA";
      length: number;
      kbps: number;
      khz: number;
      channels: number;
  } | {
      type: "SET_VOLUME";
      volume: number;
  } | {
      type: "SET_BALANCE";
      balance: number;
  } | {
      type: "TOGGLE_REPEAT";
  } | {
      type: "TOGGLE_SHUFFLE";
    };

export interface SettingsState {
  availableSkins: Array<Skin>;
}

export interface NetworkState {
  connected: boolean;
}

export interface MediaState {
  timeMode: string; // TODO: Convert this to an enum
  timeElapsed: number;
  length: number | null;
  kbps: number| null;
  khz: number | null;
  volume: number;
  balance: number;
  channels: number | null; // TODO: Convert this to an enum
  shuffle: boolean;
  repeat: boolean;
  status: string | null; // TODO: Convert this to an enum
}
