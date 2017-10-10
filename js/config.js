import skin from "../skins/base-2.91.wsz";
import audio from "../mp3/llama-2.91.mp3";

const { hash } = window.location;
let config = {};
if (hash) {
  try {
    config = JSON.parse(decodeURIComponent(hash).slice(1));
  } catch (e) {
    console.error("Failed to decode config from hash: ", hash);
  }
}

// Turn on the incomplete playlist window
export const skinUrl = skin;
export const audioUrl = audio;
export const playlistEnabled = config.playlist || false;
export const noMarquee = config.noMarquee || false;
export const hideAbout = config.hideAbout || false;
export const initialState = config.initialState || undefined;
