import { Track, AppState } from "../../js/types";
// @ts-ignore
import llamaAudio from "../mp3/llama-2.91.mp3";
import { DeepPartial } from "redux";
import pokemonTheme from "../mp3/Pokemon - Pokemon Center Theme.mid";

interface Config {
  initialTracks?: Track[];
  audioUrl?: string;
  skinUrl?: string;
  disableMarquee?: boolean;
  initialState?: DeepPartial<AppState>;
}

const { hash } = window.location;
let config: Config = {};
if (hash) {
  try {
    config = JSON.parse(decodeURIComponent(hash).slice(1));
  } catch (e) {
    console.error("Failed to decode config from hash: ", hash);
  }
}

// Backwards compatibility with the old syntax
if (config.audioUrl && !config.initialTracks) {
  config.initialTracks = [{ url: config.audioUrl }];
}

export const skinUrl = config.skinUrl === undefined ? null : config.skinUrl;

// https://freemusicarchive.org/music/netBloc_Artists/netBloc_Vol_24_tiuqottigeloot/

export const initialTracks = config.initialTracks || [
  {
    metaData: { artist: "Nintendo", title: "Pokemon Theme" },
    url: pokemonTheme,
    duration: 5.322286,
  },
];

export const disableMarquee = config.disableMarquee || false;
export const initialState = config.initialState || undefined;
