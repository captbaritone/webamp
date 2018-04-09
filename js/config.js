import skin from "../skins/base-2.91-png.wsz";
// eslint-disable-next-line no-unused-vars
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
    // This seems to include the `accept-ranges` header, which GitHub Pages does not, and
    // Safari on iOS requires.
    url:
      "https://raw.githubusercontent.com/captbaritone/winamp2-js/master/mp3/llama-2.91.mp3",
    duration: 5.322286
  },
  {
    url: "https://cdn.changelog.com/uploads/podcast/291/the-changelog-291.mp3",
    metaData: {
      artist: "Changelog Media",
      title: "Winamp2-js with Jordan Eldredge"
    },
    duration: 4841.038367
  }
];

export const hideAbout = config.hideAbout || false;
export const initialState = config.initialState || undefined;
export const sentryDsn = SENTRY_DSN;
