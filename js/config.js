import llamaAudio from "../mp3/llama-2.91.mp3";

/* global SENTRY_DSN */

const { hash } = window.location;
let config = {};
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
export const initialTracks = config.initialTracks || [
  {
    url: llamaAudio
  },
  {
    url:
      "https://cdn.rawgit.com/captbaritone/webamp-music/4b556fbf/Diablo_Swing_Orchestra_-_01_-_Heroines.mp3"
  },
  {
    url:
      "https://cdn.rawgit.com/captbaritone/webamp-music/4b556fbf/Eclectek_-_02_-_We_Are_Going_To_Eclecfunk_Your_Ass.mp3"
  },
  {
    url:
      "https://cdn.rawgit.com/captbaritone/webamp-music/4b556fbf/Auto-Pilot_-_03_-_Seventeen.mp3"
  },
  {
    url:
      "https://cdn.rawgit.com/captbaritone/webamp-music/4b556fbf/Muha_-_04_-_Microphone.mp3"
  },
  {
    url:
      "https://cdn.rawgit.com/captbaritone/webamp-music/4b556fbf/Just_Plain_Ant_-_05_-_Stumble.mp3"
  },
  {
    url:
      "https://cdn.rawgit.com/captbaritone/webamp-music/4b556fbf/Sleaze_-_06_-_God_Damn.mp3"
  },
  {
    url:
      "https://cdn.rawgit.com/captbaritone/webamp-music/4b556fbf/Juanitos_-_07_-_Hola_Hola_Bossa_Nova.mp3"
  },
  {
    url:
      "https://cdn.rawgit.com/captbaritone/webamp-music/4b556fbf/Entertainment_for_the_Braindead_-_08_-_Resolutions_Chris_Summer_Remix.mp3"
  },
  {
    url:
      "https://cdn.rawgit.com/captbaritone/webamp-music/4b556fbf/Nobara_Hayakawa_-_09_-_Trail.mp3"
  },
  {
    url:
      "https://cdn.rawgit.com/captbaritone/webamp-music/4b556fbf/Paper_Navy_-_10_-_Tongue_Tied.mp3"
  },
  {
    url:
      "https://cdn.rawgit.com/captbaritone/webamp-music/4b556fbf/60_Tigres_-_11_-_Garage.mp3"
  },
  {
    url:
      "https://cdn.rawgit.com/captbaritone/webamp-music/4b556fbf/CM_aka_Creative_-_12_-_The_Cycle_Featuring_Mista_Mista.mp3"
  }
];

export const hideAbout = config.hideAbout || false;
export const disableMarquee = config.disableMarquee || false;
export const initialState = config.initialState || undefined;
export const milkdrop = config.milkdrop || false;
export const sentryDsn = SENTRY_DSN;
