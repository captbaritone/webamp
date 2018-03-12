import skin from "../skins/base-2.91.wsz";
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

// Turn on the incomplete playlist window
export const skinUrl = config.skinUrl === undefined ? skin : config.skinUrl;
export const initialTracks = config.initialTracks || [
  {
    metaData: { artist: "DJ Mike Llama", title: "Llama Whippin' Intro" },
    url: llamaAudio
  }
];

export const hideAbout = config.hideAbout || false;
export const initialState = config.initialState || undefined;
export const sentryDsn = SENTRY_DSN;
